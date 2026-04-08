import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: isCI ? 2 : 1,
  reporter: isCI
    ? [["html"], ["junit", { outputFile: "test-results/e2e-results.xml" }]]
    : [["html"]],
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: isCI ? "on-first-retry" : "off",
  },
  webServer: {
    command: isCI ? "npm run start" : "npm run dev",
    port: 3000,
    reuseExistingServer: !isCI,
    timeout: 60000,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
