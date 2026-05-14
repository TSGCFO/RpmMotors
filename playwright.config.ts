import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright launches its own dev server on port 5001 with
 * `E2E_FAST_PIPELINE=1` set. This keeps the fast-pipeline stub out of
 * the default `Start application` workflow (which now runs plain
 * `npm run dev`), so routine dev/manual QA always exercises the real
 * Claude pipeline. Operators must opt in to the stub explicitly by
 * running the e2e suite.
 */
const E2E_PORT = Number(process.env.E2E_PORT ?? 5001);
const E2E_BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: E2E_BASE_URL,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `E2E_FAST_PIPELINE=1 E2E_TEST_BYPASS=1 PORT=${E2E_PORT} npm run dev`,
        url: E2E_BASE_URL,
        reuseExistingServer: false,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
