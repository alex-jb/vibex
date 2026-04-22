import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["e2e/**", "node_modules/**"],
    // Per-file DOM env is opt-in via /** @vitest-environment happy-dom */
    // pragma at the top of test files that need window/document.
    // Default stays node so unrelated tests don't pay the JSDOM cost.
    environmentMatchGlobs: [
      // analytics + future tracked-* component tests need a window object
      ["lib/__tests__/analytics.test.ts", "happy-dom"],
      ["components/**/__tests__/**", "happy-dom"],
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
