// next.config.js
const path = require("path");
const process = require("process");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const pathBuilder = (subpath) => path.join(process.cwd(), subpath);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    // --- your existing Cesium copies ---
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: pathBuilder("node_modules/cesium/Build/Cesium/Workers"),
            to: "../public/cesium/Workers",
            info: { minimized: true },
          },
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: pathBuilder("node_modules/cesium/Build/Cesium/ThirdParty"),
            to: "../public/cesium/ThirdParty",
            info: { minimized: true },
          },
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: pathBuilder("node_modules/cesium/Build/Cesium/Assets"),
            to: "../public/cesium/Assets",
            info: { minimized: true },
          },
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: pathBuilder("node_modules/cesium/Build/Cesium/Widgets"),
            to: "../public/cesium/Widgets",
            info: { minimized: true },
          },
        ],
      }),
      new webpack.DefinePlugin({ CESIUM_BASE_URL: JSON.stringify("/cesium") })
    );

    // --- add: copy SGP4 demo assets into /public/lightweight ---
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          // JS bundle exposed by your sgp4 package (browser build)
          {
            from: pathBuilder("node_modules/sgp4.gl/dist/browser/sgp4.iife.js"),
            to: "../public/lightweight/sgp4.iife.js",
          },
          // The wasm artifact needed by the runtime
          {
            from: pathBuilder("node_modules/sgp4.gl/pkg/sgp4_bg.wasm"),
            to: "../public/lightweight/sgp4_bg.wasm",
          },
        ],
      })
    );

    return config;
  },

  // --- add: rewrite so /lightweight serves the html file ---
  async rewrites() {
    return [
      { source: "/lightweight", destination: "/lightweight/index.html" },
      // optional: also handle trailing slash → same doc
      { source: "/lightweight/", destination: "/lightweight/index.html" },
    ];
  },

  // --- add (optional but safe): ensure correct WASM headers in dev/standalone ---
  async headers() {
    return [
      {
        source: "/:path*\\.wasm",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          // prevents caching while iterating; remove for prod if desired
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },

  output: "standalone",
};

module.exports = nextConfig;
