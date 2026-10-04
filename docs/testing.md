# Testing and CI

[Back to the README](../README.md)

| Script              | What it runs                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `bun run test:unit` | [Vitest](https://vitest.dev) in Nuxt's test environment (`tests/nuxt`), in a few seconds |
| `bun run test:api`  | [Playwright](https://playwright.dev) requests against every endpoint (`tests/api`)       |
| `bun run test:e2e`  | Playwright in a browser (`tests/e2e`)                                                    |
| `bun run test`      | All three                                                                                |

- **Unit tests** cover the pure code: the permission matrix, CSV escaping, every zod schema, the navigation helpers, the formatters, the help content, and the page error boundary.
- **API tests** cover sessions and roles (401 and 403), the four resources, analytics, team invitations, the account, settings and reset, billing, support, notifications, reminders, search, CSV export and bulk actions.
- **End-to-end tests** cover signing in and out (including the idle sign-out, using a fake clock), roles, creating, editing and deleting records, export and bulk actions, the command palette and shortcuts, the profile, settings, billing, help and team pages, the bell and reminders, the 404 page, and that every page loads without console errors or hydration warnings, at 375px wide and in dark mode.
- The API and end-to-end tests build the app and start the production server on port 3222. To use a server you already have running, set `PW_BASE_URL`, for example `PW_BASE_URL=http://localhost:3000 bunx playwright test --project=api`.
- The mock store is shared and lives in memory, so the tests run one at a time and every test starts by resetting it.
- The first run needs a browser: `bunx playwright install chromium`.
- Not covered yet: an automated accessibility scan.

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs the linter, the formatter check, the type check, the unit tests and the build, then the API and browser tests, and checks the commit messages on pull requests. Run the same commands locally before you push.
