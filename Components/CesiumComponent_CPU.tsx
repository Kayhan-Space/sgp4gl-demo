// Optimized Cesium Satellite Tracker Component
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
import { Constants, Elements, Sgp4 } from "@/sgp4/bindings/sgp4/sgp4";
import { bindings } from "@/sgp4";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { TLE } from "@/types/tle";

export interface SatMetadata {
  satName: string;
  noradID: string;
  sgp4Constants: Constants;
  sgp4Elements: Elements;
  TLEEpochJulian: JulianDate;
  idx: number;
}

export const CesiumComponent_CPU: React.FC<{
  CesiumJs: CesiumType;
  TLEs: TLE[];
}> = ({ CesiumJs, TLEs }) => {
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
  const modelMatrixRef = React.useRef<Matrix4>(new CesiumJs.Matrix4());
  const [sgp4Module, setSgp4Module] = React.useState<Sgp4 | null>(null);
  const reusableCartesian = React.useRef(new CesiumJs.Cartesian3());

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

    cesiumViewer.current.clock.startTime = CesiumJs.JulianDate.fromDate(
      new Date("2024-04-14T00:00:00.000Z")
    );
    cesiumViewer.current.clock.stopTime = CesiumJs.JulianDate.fromDate(
      new Date("2024-04-17T00:00:00.000Z")
    );
    cesiumViewer.current.clock.currentTime = CesiumJs.JulianDate.fromDate(
      new Date("2024-04-14T00:00:00.000Z")
    );

    viewer.clock.currentTime = CesiumJs.JulianDate.clone(
      viewer.clock.startTime
    );
    viewer.clock.multiplier = 300;

    viewer.scene.screenSpaceCameraController.minimumZoomDistance =
      6378135 + 500000;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 0.5e9;
    viewer.scene.globe.enableLighting = true;

    if (!sgp4Module) bindings.sgp4().then(setSgp4Module);
  }, [CesiumJs, sgp4Module]);

  React.useEffect(() => {
    if (
      isLoadedRef.current ||
      !cesiumViewer.current ||
      !sgp4Module ||
      !TLEs.length
    )
      return;

    const viewer = cesiumViewer.current;
    const newPoints = viewer.scene.primitives.add(
      new CesiumJs.PointPrimitiveCollection()
    );
    const metadata: SatMetadata[] = [];
    let idx = 0;

    TLEs.forEach((TLE) => {
      if (typeof TLE[1] === "string" && typeof TLE[2] === "string") {
        const name = TLE[0]?.slice(2) ?? "Unknown";
        const id = TLE[2].length > 8 ? TLE[2].slice(2, 7) : "Unknown";
        const elements = Elements.fromTle(sgp4Module, name, TLE[1], TLE[2]);

        if (elements.tag === "ok") {
          const TLEEpoch = elements.val.getDatetime();
          const TLEEpochTs =
            Number(TLEEpoch.secs) * 1000 + TLEEpoch.nsecs / 1000000;
          const epoch = CesiumJs.JulianDate.fromDate(new Date(TLEEpochTs));
          const constants = Constants.fromElements(sgp4Module, elements.val);

          if (constants.tag === "ok") {
            newPoints.add({
              position: CesiumJs.Cartesian3.clone(CesiumJs.Cartesian3.ZERO),
              color: CesiumJs.Color.WHITE,
              pixelSize: 2,
            });

            metadata.push({
              satName: name,
              noradID: id,
              sgp4Constants: constants.val,
              sgp4Elements: elements.val,
              TLEEpochJulian: epoch,
              idx: idx++,
            });
          }
        }
      }
    });

    pointsMetadataRef.current = metadata;
    pointsCollectionRef.current = newPoints;
    pointsCollectionPrimitivesRef.current =
      newPoints._pointPrimitives as PointPrimitive[];

    const timeLimit = CesiumJs.JulianDate.compare(
      viewer.clock.stopTime,
      viewer.clock.startTime
    );

    const animate = () => {
      if (!pointsMetadataRef.current || !pointsCollectionPrimitivesRef.current)
        return;
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

      if (!lastJDateRef.current) {
        lastJDateRef.current = CesiumJs.JulianDate.clone(now);
      }

      const diffSeconds = CesiumJs.JulianDate.secondsDifference(
        now,
        lastJDateRef.current
      );

      // Only update ICRF to Fixed matrix if more than 1 second has passed
      if (Math.abs(diffSeconds) > 1.0) {
        lastJDateRef.current = CesiumJs.JulianDate.clone(
          now,
          lastJDateRef.current
        );
        const icrfMatrix = CesiumJs.Transforms.computeIcrfToFixedMatrix(now);
        if (icrfMatrix) {
          modelMatrixRef.current =
            CesiumJs.Matrix4.fromRotationTranslation(icrfMatrix);
          pointsCollectionRef.current!.modelMatrix = modelMatrixRef.current;
        }
      }

      for (let i = 0; i < pointsCollectionPrimitivesRef.current.length; i++) {
        const meta = pointsMetadataRef.current[i];
        const point = pointsCollectionPrimitivesRef.current[i];
        const minutes =
          CesiumJs.JulianDate.secondsDifference(now, meta.TLEEpochJulian) / 60;
        const result = meta.sgp4Constants.propagate(minutes);
        if (result.tag === "ok") {
          const pos = result.val.position;
          CesiumJs.Cartesian3.fromElements(
            pos[0] * 1000,
            pos[1] * 1000,
            pos[2] * 1000,
            reusableCartesian.current
          );
          point.position = reusableCartesian.current;
        }
      }
    };

    viewer.scene.preRender.addEventListener(animate);
    isLoadedRef.current = true;
  }, [CesiumJs, TLEs, sgp4Module]);

  return (
    <div
      ref={cesiumContainerRef}
      id="cesium-container"
      style={{ height: "100vh", width: "100vw" }}
    />
  );
};

export default CesiumComponent_CPU;
