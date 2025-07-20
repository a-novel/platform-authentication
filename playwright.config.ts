import packageJson from "./package.json" with { type: "json" };

import { derivePort } from "@a-novel/nodelib/test/e2e";

import { defineConfig, devices } from "@playwright/test";

const PORT = await derivePort(packageJson.name);

const MOCK_ENV = {
  PORT: PORT.toString(),
  VITE_SERVER_PORT: PORT.toString(),
  VITE_TOLGEE_CDN: process.env.VITE_TOLGEE_CDN,
  VITE_SERVICE_AUTH_URL: "http://service.auth.test",
  VITE_NODE_ENV: "test",
};

const MOCK_ENV_STRING = Object.entries(MOCK_ENV)
  .map(([key, value]) => `${key}="${value!.replaceAll(`"`, `\\"`)}"`)
  .join(" ");

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./src/routes.test",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["dot"]],

  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://${process.env.PW_TEST_CONNECT_WS_ENDPOINT ? "hostmachine" : "localhost"}:${PORT}`,
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 5000,
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
  /* Maximum time one test can run for. */
  timeout: 30000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium HD",
      use: { ...devices["Desktop Chrome HiDPI"] },
    },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  webServer: {
    command: `${MOCK_ENV_STRING} vite build --sourcemap="inline" && ${MOCK_ENV_STRING} pnpm start:ci`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    stderr: "pipe",
    // stdout: "pipe",
  },
});
