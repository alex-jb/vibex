/**
 * Remotion config — must live at the project root so the Remotion CLI
 * picks it up automatically (no --config flag needed). Re-applies the
 * settings that used to live in `remotion/remotion.config.ts` (still
 * there for reference / Remotion Studio).
 *
 * Why this file exists: `remotion/src/DemoVertical.tsx` imports
 * `@/lib/blob-urls`. Remotion's webpack alias `@` → project root only
 * gets wired up via overrideWebpackConfig — if the config isn't loaded,
 * webpack can't resolve `@/*` imports and bundling fails. Before
 * 2026-04-24 nothing in remotion/ used `@`-aliased imports so the
 * misplaced config was a silent bug; adding blob-urls broke everything.
 */

import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("remotion/src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setPixelFormat("yuv420p");
Config.setConcurrency(4);
Config.setPublicDir("public");

// process.cwd() = project root (Remotion CLI is invoked from there). Using
// __dirname here resolved to the bundled CLI internals instead — that's what
// made webpack look for `@/lib/blob-urls` inside @remotion/cli/dist/.
const PROJECT_ROOT = path.resolve(process.cwd());

Config.overrideWebpackConfig((currentConfig) => {
  return {
    ...currentConfig,
    resolve: {
      ...currentConfig.resolve,
      alias: {
        ...currentConfig.resolve?.alias,
        "@": PROJECT_ROOT,
      },
    },
  };
});
