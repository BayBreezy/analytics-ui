import { defineVitestConfig } from "@nuxt/test-utils/config";

// Unit tests live in `tests/nuxt` (typed by Nuxt like the app) and run inside Nuxt's test environment so the auto-imports (the shared constants and
// helpers, `tv`, ...) resolve the way they do in the app. The Playwright specs are separate.
export default defineVitestConfig({
  test: {
    environment: "nuxt",
    include: ["tests/nuxt/**/*.test.ts"],
  },
});
