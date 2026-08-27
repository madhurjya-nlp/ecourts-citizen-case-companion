import { defineConfig } from "@playwright/test";

const port = Number(process.env.ECOURTS_TEST_PORT || 43917);

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.mjs",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `python -m http.server ${port} --bind 127.0.0.1`,
    url: `http://127.0.0.1:${port}/index.html`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
