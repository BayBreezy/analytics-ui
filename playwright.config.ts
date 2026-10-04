import { defineConfig, devices } from "@playwright/test";
import { BASE_URL, PORT } from "./tests/baseUrl";

// Run against a server you already started with PW_BASE_URL (for example `bun run dev --port 3111`).
// Otherwise the production build is made and started on its own port, never the usual dev port.
const externalUrl = process.env.PW_BASE_URL;
const baseURL = BASE_URL;

export default defineConfig({
  testDir: "./tests",
  // The mock store lives in the server's memory and is shared, so tests can't run side by side.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "api", testDir: "./tests/api", testMatch: "**/*.spec.ts" },
    {
      name: "e2e",
      testDir: "./tests/e2e",
      testMatch: "**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: externalUrl
    ? undefined
    : {
        command: `bun run build && PORT=${PORT} node .output/server/index.mjs`,
        url: `${baseURL}/login`,
        timeout: 300_000,
        // Two runs sharing one server would reset each other's data in the middle of a test, so a
        // second run fails right away on the busy port instead. Use PW_BASE_URL to share on purpose.
        reuseExistingServer: false,
      },
});
