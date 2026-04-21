/**
 * Remotion config — tell the bundler where entry lives, how to handle
 * TypeScript path aliases, and what output format to render.
 */

import { Config } from "@remotion/cli/config";

Config.setEntryPoint("remotion/src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setPixelFormat("yuv420p");
Config.setConcurrency(4);
Config.setPublicDir("public");

// Allow importing from the root @/* aliases (e.g. @/components/home/hero-card)
// for future scenes that want to render actual product React components
// inside the video. Requires the webpack override below.
Config.overrideWebpackConfig((currentConfig) => {
  return {
    ...currentConfig,
    resolve: {
      ...currentConfig.resolve,
      alias: {
        ...currentConfig.resolve?.alias,
        "@": require("node:path").resolve(__dirname, ".."),
      },
    },
  };
});
