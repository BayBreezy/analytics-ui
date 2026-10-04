# Architecture

[Back to the README](../README.md)

## Tech stack

- [Nuxt 4](https://nuxt.com) with Vue 3, running on [Bun](https://bun.sh)
- [UI Thing](https://uithing.com) components (Reka UI, tailwind-variants), [Tailwind CSS v4](https://tailwindcss.com)
- [vee-validate](https://vee-validate.logaretm.com) + [zod](https://zod.dev) for forms
- [VueUse](https://vueuse.org) (`useIdle` and others), [vue-sonner](https://vue-sonner.vercel.app) for toasts
- [ApexCharts](https://apexcharts.com) and [TanStack Table](https://tanstack.com/table) (UI Thing components) for charts and tables
- [@faker-js/faker](https://fakerjs.dev) for mock data
- [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for linting and formatting

## How it fits together

- **One repo, two halves.** `app/` is the Nuxt UI and `server/` is a mock REST API in the same project. `shared/` holds what both sides use: the zod schemas (a form and the API validate with the same one), the types and the permission matrix.
- **Data lives in server memory.** A seeded in-memory store (`server/utils/store.ts`) backs every endpoint, so changes show up at once and reset when the server restarts. Settings, billing, notifications and support tickets live there too.
- **Roles are enforced twice.** The permission matrix in `shared/utils/permissions.ts` drives the navigation, the page guards and the buttons, and the same checks run in the API (401 without a session, 403 for the wrong role).
- **One list page for four resources.** Customers, orders, products and staff share one API (`server/api/[resource]/`) and four generic pages, with a small component set per resource.
- **Sign-in is simulated.** The session is a cookie, the route middleware redirects to the login page and back to the last page, and an idle timer signs you out.
- **UI Thing components** are generated into `app/components/Ui/`. A few have small edits, listed in `AGENTS.md`.

## Project structure

```
app/
  components/
    Analytics/       Chart card and the analytics charts and tables
    Billing/         Plan card, plans dialog, payment methods and invoices
    App/             Sidebar, header, error state and confirm dialog
    Customers/       List, Form and Details (same for Orders, Products and Staff)
    Dashboard/       Dashboard widgets (stat cards, sales chart, tables, feeds)
    Help/            FAQ, contact, shortcuts and changelog tabs
    Profile/         Personal info, password, sessions and delete-account cards
    Resource/        Generic list page, row actions, delete dialog, form shell and searchable select
    Settings/        The tabs of the settings page
    Team/            Members and invitations tabs and the invite dialog
    Ui/              UI Thing components (generated, safe to edit)
  composables/       useAuth, usePreferences, useSettings, useGlobalShortcuts, useChartColors, useQueryParam, useResource*
  layouts/           auth (centered card) and default (admin layout with sidebar)
  middleware/        auth.global.ts: route protection and last-visited redirect
  pages/             login, register, forgot-password, dashboard, settings, help, analytics/*, account/*
  plugins/           idle-logout.client.ts
  resource-pages/    the generic list, create, details and edit pages
  utils/             navigation.ts (sidebar links and routes), format helpers
server/
  api/account/       profile, password and sessions
  api/analytics/     mock analytics data
  api/auth/          mock auth endpoints
  api/billing/       plan, usage, cards and invoices
  api/[resource]/    list, create, get, update and delete for every resource
  api/dashboard/     mock dashboard data
  api/settings/      store settings and the data reset
  api/support/       support tickets
  api/team/          invitations
  utils/             in-memory store, faker helpers and request validation
shared/              zod schemas, types and the resource registry used by app and server
tests/
  nuxt/              unit tests (Vitest, Nuxt environment)
  api/               API tests (Playwright, no browser)
  e2e/               end-to-end tests (Playwright, browser)
```

## Contributing

Git hooks (husky) run on every commit:

- **pre-commit** runs lint-staged, which lints and formats the staged files.
- **commit-msg** runs commitlint, so commit messages must follow [Conventional Commits](https://www.conventionalcommits.org) (for example `feat: add sidebar`).

GitHub Actions (`.github/workflows/ci.yml`) runs the linter, formatter check, type check, unit tests and build, then the API and browser tests, and checks the commit messages on pull requests. Run the same commands locally before you push.

Add components with the UI Thing CLI, for example `bunx --bun ui-thing@latest add button`.
