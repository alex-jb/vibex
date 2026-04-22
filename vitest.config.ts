import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["e2e/**", "node_modules/**"],
    // Per-file DOM env is opt-in via @vitest-environment pragma at the
    // top of test files that need window/document (e.g. analytics.test.ts
    // uses happy-dom). Default stays node so unrelated tests don't pay
    // the DOM cost. vitest v4 removed environmentMatchGlobs — pragma
    // approach works across all versions.
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
