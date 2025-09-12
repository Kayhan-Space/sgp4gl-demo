"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { CesiumType } from "../types/cesium";
import { TLE } from "@/types/tle";

const CesiumDynamicComponent = dynamic(
  () => import("./PerformanceComparison"),
  {
    ssr: false,
  }
);

export const CesiumWrapper: React.FunctionComponent<{
  TLEs: TLE[];
}> = ({ TLEs }) => {
  const [CesiumJs, setCesiumJs] = React.useState<CesiumType | null>(null);

  React.useEffect(() => {
    if (CesiumJs !== null) return;
    const CesiumImportPromise = import("cesium");
    Promise.all([CesiumImportPromise]).then((promiseResults) => {
      const { ...Cesium } = promiseResults[0];
      setCesiumJs(Cesium);
    });
  }, [CesiumJs]);

  return CesiumJs ? <CesiumDynamicComponent TLEs={TLEs} /> : null;
};

export default CesiumWrapper;
