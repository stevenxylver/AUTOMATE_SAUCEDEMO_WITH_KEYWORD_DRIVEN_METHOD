import { defineConfig, devices } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [
      "allure-playwright",
      {
        detail: true,
        suiteTitle: true,
        attachments: true,
        environmentInfo: {
          framework: "Playwright",
          language: "TypeScript",
          nodeVersion: process.version,
          os: process.platform,
        },
      },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on",
    screenshot: "on",
    video: {
      mode: "on",
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
    actionTimeout: 60000,
    navigationTimeout: 60000,
    launchOptions: {
      args: [
        "--window-size=1280,720",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--use-fake-ui-for-media-stream",
      ],
      slowMo: 50,
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--window-size=1280,720",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--use-fake-ui-for-media-stream",
          ],
        },
      },
    },
  ],
  outputDir: "test-results/",
  testMatch: "**/*.ts",
});
