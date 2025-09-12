// Cesium Satellite Tracker Component — GPU version shaped to mirror the CPU reference
"use client";

import React from "react";
import type { CesiumType } from "../types/cesium";
import type {
  Viewer,
  PointPrimitive,
  PointPrimitiveCollection,
  JulianDate,
  Matrix4,
} from "cesium";
// Styles for default Cesium UI and controls
import "cesium/Build/Cesium/Widgets/widgets.css";

// sgp4.gl (WebGPU/WebGL) bindings
import wasmInit, {
  WasmElements,
  WasmConstants,
  WasmGpuConsts,
  GpuPropagator,
} from "sgp4.gl";

import { TLE } from "@/types/tle";

export interface SatMetadata {
  satName: string;
  noradID: string;
  TLEEpochJulian: JulianDate; // to mirror CPU version
  idx: number;
}

// Minimal position buffer; values expected in meters in TEME frame
interface PositionBuffer {
  x: number;
  y: number;
  z: number;
}

// Helper: parse epoch (YYDDD.DDDDDDDD) into Date -> JulianDate
function tleEpochToJulian(CesiumJs: CesiumType, epochStr: string): JulianDate {
  let year = parseInt(epochStr.substring(0, 2), 10);
  const day = parseFloat(epochStr.substring(2));
  year = year < 57 ? 2000 + year : 1900 + year;
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const epochTimeMs = startOfYear.getTime() + (day - 1) * 24 * 60 * 60 * 1000;
  return CesiumJs.JulianDate.fromDate(new Date(epochTimeMs));
}

export const CesiumComponent: React.FC<{
  CesiumJs: CesiumType;
  TLEs: TLE[];
}> = ({ CesiumJs, TLEs }) => {
  // ——— Refs/State shaped like CPU component ———
  const cesiumViewer = React.useRef<Viewer | null>(null);
  const cesiumContainerRef = React.useRef<HTMLDivElement>(null);
  const pointsCollectionRef = React.useRef<PointPrimitiveCollection | null>(
    null
  );
  const pointsCollectionPrimitivesRef = React.useRef<PointPrimitive[] | null>(
    null
  );
  const pointsMetadataRef = React.useRef<SatMetadata[] | null>(null);
  const isLoadedRef = React.useRef(false);
  const lastJDateRef = React.useRef<JulianDate | null>(null);
  const modelMatrixRef = React.useRef<Matrix4 | null>(null);

  // Pre-allocated Cesium Cartesian3 objects, one per satellite (avoids GC)
  const preAllocatedCartesianRef = React.useRef<any[]>([]);

  // ——— GPU propagator plumbing (kept minimal, mirrors CPU animate loop) ———
  const gpuPropagatorRef = React.useRef<typeof GpuPropagator | null>(null);
  const registeredConstSetIdRef = React.useRef<number | null>(null);
  const wasmConstantsRef = React.useRef<(typeof WasmConstants)[] | null>(null);

  // Double buffers for streaming positions from GPU -> renderer
  const currentPositionsRef = React.useRef<PositionBuffer[]>([]);
  const targetPositionsRef = React.useRef<PositionBuffer[]>([]);

  // Book-keeping for safe cleanup
  const isComponentAliveRef = React.useRef<boolean>(true);
  const inflightRef = React.useRef<number>(0);

  // ——— Viewer init ———
  React.useEffect(() => {
    if (cesiumViewer.current || !cesiumContainerRef.current) return;

    cesiumViewer.current = new CesiumJs.Viewer(cesiumContainerRef.current, {
      maximumRenderTimeChange: Infinity,
      shadows: false,
      terrainProvider: new CesiumJs.EllipsoidTerrainProvider(),
      baseLayer: CesiumJs.ImageryLayer.fromProviderAsync(
        Promise.resolve(
          new CesiumJs.UrlTemplateImageryProvider({
            url: `${process.env.NEXT_PUBLIC_TILES_URL}{z}/{x}/{reverseY}.png`,
            tilingScheme: new CesiumJs.WebMercatorTilingScheme(),
            tileWidth: 256,
            tileHeight: 256,
            maximumLevel: 5,
            credit: undefined,
          })
        ),
        {}
      ),
    });

    const viewer = cesiumViewer.current;
    viewer.clock.clockStep = CesiumJs.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
    viewer.clock.canAnimate = true;
    viewer.clock.shouldAnimate = true;

    viewer.clock.startTime = CesiumJs.JulianDate.fromDate(
      new Date("2024-04-14T00:00:00.000Z")
    );
    viewer.clock.stopTime = CesiumJs.JulianDate.fromDate(
      new Date("2024-04-17T00:00:00.000Z")
    );
    viewer.clock.currentTime = CesiumJs.JulianDate.clone(
      viewer.clock.startTime
    );
    viewer.clock.multiplier = 300;

    viewer.scene.screenSpaceCameraController.minimumZoomDistance =
      6378135 + 500000;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 0.5e9;
    viewer.scene.globe.enableLighting = true;
  }, [CesiumJs]);

  // ——— GPU init + TLE ingestion (mirrors CPU "load once" guard) ———
  React.useEffect(() => {
    const boot = async () => {
      if (isLoadedRef.current || !cesiumViewer.current || !TLEs.length) return;

      // Try WebGPU first, then WebGL fallback
      try {
        await wasmInit();
        try {
          gpuPropagatorRef.current = await GpuPropagator.new_for_web();
        } catch {
          gpuPropagatorRef.current = await GpuPropagator.new_for_web_gl();
        }
      } catch (e) {
        console.error("Failed to initialize sgp4.gl", e);
        return;
      }

      if (!gpuPropagatorRef.current) return;

      // Create points collection (like CPU version)
      const points = cesiumViewer.current.scene.primitives.add(
        new CesiumJs.PointPrimitiveCollection()
      );

      const metadata: SatMetadata[] = [];
      const preAllocated: any[] = [];
      const curr: PositionBuffer[] = [];
      const next: PositionBuffer[] = [];

      let idx = 0;

      // Build WasmElements / WasmConstants from valid TLEs
      const parsed = TLEs.map((tle) => {
        if (typeof tle[1] === "string" && typeof tle[2] === "string") {
          const satName =
            typeof tle[0] === "string" && tle[0].length > 2
              ? tle[0].slice(2)
              : "Unknown";
          try {
            const elements = WasmElements.from_tle(
              new TextEncoder().encode(satName),
              new TextEncoder().encode(tle[1]),
              new TextEncoder().encode(tle[2])
            );
            return { elements, tle };
          } catch {
            return null;
          }
        }
        return null;
      }).filter(
        (x): x is { elements: typeof WasmElements; tle: TLE } => x !== null
      );

      const constants = parsed.map(({ elements }) =>
        WasmConstants.from_elements(elements)
      );
      wasmConstantsRef.current = constants;

      // Register constants set on GPU (optimal batched path)
      const gpuConsts = constants.map((c) => WasmGpuConsts.from_constants(c));
      const constSetId = gpuPropagatorRef.current.register_const_set(gpuConsts);
      registeredConstSetIdRef.current = constSetId;

      // Create points & sat metadata arrays aligned by index (like CPU)
      parsed.forEach(({ tle }) => {
        const satName =
          typeof tle[0] === "string" && tle[0].length > 2
            ? tle[0].slice(2)
            : "Unknown";
        const noradID = tle[2].length > 8 ? tle[2].slice(2, 7) : "Unknown";
        const epochStr = tle[1].substring(18, 32);
        const epochJul = tleEpochToJulian(CesiumJs, epochStr);

        const pre = new CesiumJs.Cartesian3(0, 0, 0);
        preAllocated.push(pre);
        curr.push({ x: 0, y: 0, z: 0 });
        next.push({ x: 0, y: 0, z: 0 });

        points.add({
          position: pre,
          color: CesiumJs.Color.WHITE,
          pixelSize: 2,
        });

        metadata.push({
          satName,
          noradID,
          TLEEpochJulian: epochJul,
          idx: idx++,
        });
      });

      pointsMetadataRef.current = metadata;
      pointsCollectionRef.current = points;
      // Cast to access underlying array like the CPU code does
      pointsCollectionPrimitivesRef.current = (points as any)
        ._pointPrimitives as PointPrimitive[];
      preAllocatedCartesianRef.current = preAllocated;
      currentPositionsRef.current = curr;
      targetPositionsRef.current = next;

      const timeLimit = CesiumJs.JulianDate.compare(
        cesiumViewer.current.clock.stopTime,
        cesiumViewer.current.clock.startTime
      );

      // Background GPU propagation loop (self-sustaining via rAF)
      const propagateLoop = async () => {
        if (!isComponentAliveRef.current) return;
        const viewer = cesiumViewer.current!;
        const now = viewer.clock.currentTime;
        const metadata = pointsMetadataRef.current!;

        if (
          !gpuPropagatorRef.current ||
          registeredConstSetIdRef.current === null
        )
          return;
        if (!metadata.length) return;
        if (inflightRef.current !== 0) {
          // Defer until the current run completes to reduce variance
          requestAnimationFrame(propagateLoop);
          return;
        }

        inflightRef.current++;
        try {
          // Compute minutes since each TLE epoch
          const times = new Float64Array(
            metadata.map(
              (m) =>
                CesiumJs.JulianDate.secondsDifference(now, m.TLEEpochJulian) /
                60.0
            )
          );

          const flat = await gpuPropagatorRef.current.propagate_registered_f32(
            registeredConstSetIdRef.current,
            times
          );

          // Copy into target buffer (km -> m)
          const tgt = targetPositionsRef.current;
          const N = flat.length / 6; // [x y z vx vy vz]
          for (let i = 0; i < N; i++) {
            const o = i * 6;
            tgt[i].x = flat[o] * 1000.0;
            tgt[i].y = flat[o + 1] * 1000.0;
            tgt[i].z = flat[o + 2] * 1000.0;
          }
        } catch (e) {
          console.error("GPU propagate loop error", e);
        } finally {
          inflightRef.current--;
          requestAnimationFrame(propagateLoop);
        }
      };

      // Render/animate loop (mirrors CPU preRender listener structure)
      const animate = () => {
        if (
          !pointsMetadataRef.current ||
          !pointsCollectionPrimitivesRef.current ||
          !pointsCollectionRef.current
        )
          return;

        const viewer = cesiumViewer.current!;
        const now = viewer.clock.currentTime;

        if (
          Math.abs(CesiumJs.JulianDate.compare(now, viewer.clock.stopTime)) >
          timeLimit
        ) {
          viewer.clock.currentTime = CesiumJs.JulianDate.clone(
            viewer.clock.startTime
          );
          return;
        }

        // Only update transform when time changes by > 1 second (like CPU)
        if (!lastJDateRef.current) {
          lastJDateRef.current = CesiumJs.JulianDate.clone(now);
        }
        const diffSeconds = CesiumJs.JulianDate.secondsDifference(
          now,
          lastJDateRef.current
        );

        if (Math.abs(diffSeconds) > 1.0) {
          lastJDateRef.current = CesiumJs.JulianDate.clone(
            now,
            lastJDateRef.current
          );
          // Prefer TEME->pseudo-fixed (sgp4 outputs TEME); fallback to ICRF
          const teme = CesiumJs.Transforms.computeTemeToPseudoFixedMatrix(now);
          const icrf = CesiumJs.Transforms.computeIcrfToFixedMatrix(now);
          const mat =
            (teme ?? icrf) &&
            CesiumJs.Matrix4.fromRotationTranslation((teme ?? icrf) as any);
          if (mat) {
            modelMatrixRef.current = mat as Matrix4;
            pointsCollectionRef.current.modelMatrix =
              modelMatrixRef.current as Matrix4;
          }
        }

        // Move points (no alloc): copy target -> preallocated cartesian -> assign
        const pts = pointsCollectionPrimitivesRef.current;
        const curr = currentPositionsRef.current;
        const tgt = targetPositionsRef.current;
        const pre = preAllocatedCartesianRef.current;
        for (let i = 0; i < pts.length; i++) {
          // Simple step (optionally replace with smoothing if desired)
          curr[i].x = tgt[i].x;
          curr[i].y = tgt[i].y;
          curr[i].z = tgt[i].z;

          const p = pre[i];
          p.x = curr[i].x;
          p.y = curr[i].y;
          p.z = curr[i].z;

          pts[i].position = p;
        }
      };

      cesiumViewer.current.scene.preRender.addEventListener(animate);
      // kick the GPU pipeline
      requestAnimationFrame(propagateLoop);

      isLoadedRef.current = true;
    };

    boot();

    return () => {
      // Cleanup
      isComponentAliveRef.current = false;
      try {
        if (
          gpuPropagatorRef.current &&
          registeredConstSetIdRef.current !== null
        ) {
          const tryUnregister = () => {
            if (inflightRef.current === 0) {
              try {
                gpuPropagatorRef.current!.unregister_const_set(
                  registeredConstSetIdRef.current!
                );
              } catch (e) {
                console.error("unregister_const_set error", e);
              } finally {
                registeredConstSetIdRef.current = null;
              }
            } else {
              setTimeout(tryUnregister, 10);
            }
          };
          tryUnregister();
        }
      } catch (e) {
        console.error("GPU cleanup error", e);
      }
    };
  }, [CesiumJs, TLEs]);

  return (
    <div
      ref={cesiumContainerRef}
      id="cesium-container"
      style={{ height: "100vh", width: "100vw" }}
    />
  );
};

export default CesiumComponent;
