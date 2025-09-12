"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { CesiumType } from "../types/cesium";
import { TLE } from "@/types/tle";

const CesiumComponentCPU = dynamic(() => import("./CesiumComponent_CPU"), {
  ssr: false,
});

const CesiumComponentGPU = dynamic(() => import("./CesiumComponent"), {
  ssr: false,
});

type ComponentType = "CPU" | "GPU";

interface PerformanceStats {
  fps: number;
  avgFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  frameTimeVariance: number;
  smoothnessScore: number;
  totalFrames: number;
  displayRefreshRate: number;
}

export const PerformanceComparison: React.FunctionComponent<{
  TLEs: TLE[];
}> = ({ TLEs }) => {
  const [CesiumJs, setCesiumJs] = React.useState<CesiumType | null>(null);
  const [selectedComponent, setSelectedComponent] =
    React.useState<ComponentType>("GPU");
  const [stats, setStats] = React.useState<PerformanceStats>({
    fps: 0,
    avgFrameTime: 0,
    minFrameTime: 0,
    maxFrameTime: 0,
    frameTimeVariance: 0,
    smoothnessScore: 0,
    totalFrames: 0,
    displayRefreshRate: 60,
  });

  const frameTimesRef = React.useRef<number[]>([]);
  const lastFrameTimeRef = React.useRef<number>(performance.now());
  const animationFrameRef = React.useRef<number>();

  React.useEffect(() => {
    if (CesiumJs !== null) return;
    const CesiumImportPromise = import("cesium");
    Promise.all([CesiumImportPromise]).then((promiseResults) => {
      const { ...Cesium } = promiseResults[0];
      setCesiumJs(Cesium);
    });
  }, [CesiumJs]);

  // Performance monitoring
  React.useEffect(() => {
    // Detect display refresh rate
    let refreshRateDetected = 60;
    const detectRefreshRate = () => {
      const start = performance.now();
      let frameCount = 0;
      const measure = () => {
        frameCount++;
        if (frameCount < 60) {
          requestAnimationFrame(measure);
        } else {
          const elapsed = performance.now() - start;
          refreshRateDetected = Math.round(60000 / elapsed);
        }
      };
      requestAnimationFrame(measure);
    };
    detectRefreshRate();

    const measurePerformance = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Keep last 240 frames (2 seconds at 120fps, 4 seconds at 60fps)
      frameTimesRef.current.push(frameTime);
      if (frameTimesRef.current.length > 240) {
        frameTimesRef.current.shift();
      }

      // Update stats every 30 frames
      if (
        frameTimesRef.current.length % 30 === 0 &&
        frameTimesRef.current.length > 0
      ) {
        const times = frameTimesRef.current;
        const avgFrameTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minFrameTime = Math.min(...times);
        const maxFrameTime = Math.max(...times);

        // Calculate variance for smoothness
        const variance =
          times.reduce(
            (acc, time) => acc + Math.pow(time - avgFrameTime, 2),
            0
          ) / times.length;
        const standardDeviation = Math.sqrt(variance);

        // Smoothness score: lower variance = higher smoothness (0-100 scale)
        const smoothnessScore = Math.max(0, 100 - standardDeviation * 2);

        setStats({
          fps: Math.round(1000 / avgFrameTime),
          avgFrameTime: Math.round(avgFrameTime * 100) / 100,
          minFrameTime: Math.round(minFrameTime * 100) / 100,
          maxFrameTime: Math.round(maxFrameTime * 100) / 100,
          frameTimeVariance: Math.round(variance * 100) / 100,
          smoothnessScore: Math.round(smoothnessScore),
          totalFrames: frameTimesRef.current.length,
          displayRefreshRate: refreshRateDetected,
        });
      }

      animationFrameRef.current = requestAnimationFrame(measurePerformance);
    };

    animationFrameRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Reset stats when switching components
  React.useEffect(() => {
    frameTimesRef.current = [];
    setStats({
      fps: 0,
      avgFrameTime: 0,
      minFrameTime: 0,
      maxFrameTime: 0,
      frameTimeVariance: 0,
      smoothnessScore: 0,
      totalFrames: 0,
      displayRefreshRate: 60,
    });
  }, [selectedComponent]);

  const renderComponent = () => {
    if (!CesiumJs) return null;

    switch (selectedComponent) {
      case "CPU":
        return <CesiumComponentCPU CesiumJs={CesiumJs} TLEs={TLEs} />;
      case "GPU":
        return <CesiumComponentGPU CesiumJs={CesiumJs} TLEs={TLEs} />;
      default:
        return <CesiumComponentGPU CesiumJs={CesiumJs} TLEs={TLEs} />;
    }
  };

  const getPerformanceColor = (
    value: number,
    type: "fps" | "frameTime" | "smoothness"
  ) => {
    switch (type) {
      case "fps":
        if (value >= 110) return "#00ff00"; // Green for high refresh rate
        if (value >= 55) return "#66ff66"; // Light green for good FPS
        if (value >= 30) return "#ffff00"; // Yellow for okay FPS
        return "#ff0000"; // Red for poor FPS
      case "frameTime":
        if (value <= 8.5) return "#00ff00"; // Green for 120fps+ frames
        if (value <= 18) return "#66ff66"; // Light green for 60fps frames
        if (value <= 33) return "#ffff00"; // Yellow for 30fps frames
        return "#ff0000"; // Red for slow frames
      case "smoothness":
        if (value >= 80) return "#00ff00"; // Green for smooth
        if (value >= 60) return "#ffff00"; // Yellow for okay
        return "#ff0000"; // Red for choppy
      default:
        return "#ffffff";
    }
  };

  const getComponentDescription = (type: ComponentType) => {
    switch (type) {
      case "CPU":
        return "Pure JavaScript SGP4 - Baseline performance";
      case "GPU":
        return "WASM + WebGPU Batch Propagation - High-throughput performance";
      default:
        return "";
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* Performance selector overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.9)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
          minWidth: "320px",
        }}
      >
        <div
          style={{ marginBottom: "15px", fontWeight: "bold", fontSize: "14px" }}
        >
          GPU vs CPU Performance Comparison ({TLEs.length.toLocaleString()}{" "}
          satellites)
        </div>
        <div style={{ margin: "0 0 16px 0" }}>
          <a
            style={{ padding: "4px", background: "#0066ff", color: "#fff" }}
            href="https://github.com/Kayhan-Space/sgp4gl-demo"
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub Source link
          </a>
        </div>

        {/* Mode Selection */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "15px",
          }}
        >
          {(["CPU", "GPU"] as ComponentType[]).map((type) => (
            <label key={type} style={{ cursor: "pointer", padding: "4px" }}>
              <input
                type="radio"
                value={type}
                checked={selectedComponent === type}
                onChange={(e) =>
                  setSelectedComponent(e.target.value as ComponentType)
                }
                style={{ marginRight: "8px" }}
              />
              <span
                style={{
                  fontWeight: selectedComponent === type ? "bold" : "normal",
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </label>
          ))}
        </div>

        {/* Current Mode Description */}
        <div
          style={{
            marginBottom: "15px",
            padding: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
            fontSize: "11px",
          }}
        >
          {getComponentDescription(selectedComponent)}
        </div>

        {/* Performance Stats */}
        <div style={{ borderTop: "1px solid #444", paddingTop: "15px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
            📊 Real-time Performance Metrics
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <div>
              <span style={{ color: "#ccc" }}>FPS:</span>
              <span
                style={{
                  color: getPerformanceColor(stats.fps, "fps"),
                  fontWeight: "bold",
                  marginLeft: "8px",
                }}
              >
                {stats.fps}
              </span>
            </div>

            <div>
              <span style={{ color: "#ccc" }}>Avg Frame:</span>
              <span
                style={{
                  color: getPerformanceColor(stats.avgFrameTime, "frameTime"),
                  fontWeight: "bold",
                  marginLeft: "8px",
                }}
              >
                {stats.avgFrameTime}ms
              </span>
            </div>

            <div>
              <span style={{ color: "#ccc" }}>Min Frame:</span>
              <span style={{ color: "#00ff00", marginLeft: "8px" }}>
                {stats.minFrameTime}ms
              </span>
            </div>

            <div>
              <span style={{ color: "#ccc" }}>Max Frame:</span>
              <span style={{ color: "#ff6666", marginLeft: "8px" }}>
                {stats.maxFrameTime}ms
              </span>
            </div>
          </div>

          {/* Frame Variance and Display Info */}
          <div style={{ marginTop: "8px", fontSize: "10px", color: "#ccc" }}>
            Frame Variance: {stats.frameTimeVariance}ms² | Frames:{" "}
            {stats.totalFrames}
          </div>
          <div style={{ fontSize: "10px", color: "#999" }}>
            Display: {stats.displayRefreshRate}Hz | Target:{" "}
            {stats.displayRefreshRate >= 100 ? "120+" : "60"} FPS
          </div>
        </div>

        <div
          style={{
            marginTop: "12px",
            fontSize: "10px",
            opacity: 0.7,
            borderTop: "1px solid #333",
            paddingTop: "8px",
          }}
        >
          {`💡 Lower frame times and higher smoothness scores indicate better
          performance. Switch modes to compare the "butteryness" of each
          implementation!`}
        </div>
      </div>

      {renderComponent()}
    </div>
  );
};

export default PerformanceComparison;
