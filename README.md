# Analytics UI

An analytics dashboard built with [Nuxt 4](https://nuxt.com), [UI Thing](https://uithing.com) and Tailwind CSS v4. It runs entirely on dummy data: a mock API lives in Nuxt's `server/` directory and generates its data with [faker](https://fakerjs.dev).

This is a rebuild of the app from the July 2023 [YouTube tutorial](https://www.youtube.com/watch?v=0ZwaOAlRAWA). The original version is preserved on the [`tutorial-2023`](https://github.com/BayBreezy/analytics-ui/tree/tutorial-2023) branch.

> **Work in progress.** The app is being rebuilt in phases. The [Features](#features) section below describes what works today, and the [Roadmap](#roadmap) lists what's next.

## Features

### Authentication

Sign-in is a demo. There are no real accounts, nothing is stored on a server, and no email is sent. It's meant to exercise the UI and the app's routing, not to be secure.

- **Login, register and forgot-password pages**, with inline validation (zod + vee-validate), loading states, error alerts and toast notifications.
- **Password fields** have a show/hide toggle. The register form also shows a live strength meter and requirements list.
- **"Fill demo" buttons** on the login and register pages fill the form with demo data, so you can try the app in one click.
- **Remember me.** When checked, you stay signed in for 30 days. Otherwise the session ends when the browser closes.
- **Protected routes.** A global route middleware sends signed-out users to `/login`. It runs on the server too, so protected content never flashes.
- **Returns you where you were.** After signing in you land on the last page you visited (falling back to `/dashboard`). Signed-in users who open `/login`, `/register` or `/forgot-password` are redirected away from them. Unknown URLs (for example `/sw.js` requested by a browser extension) are never remembered as a destination.
- **Automatic sign-out when idle.** After 5 minutes without mouse, keyboard, scroll or touch activity you are signed out and shown a toast. Activity in any open tab counts, so using one tab won't sign you out of another. The timeout is configurable (see [Configuration](#configuration)).

**Demo account:** `demo@analytics.test` / `password123`. In practice, any well-formed email and a password of 8+ characters will sign you in.

### Admin layout

- **Collapsible sidebar** built with UI Thing's Sidebar. It collapses to an icon rail (with tooltips), remembers its state in a cookie, toggles with `Ctrl/Cmd + B`, and opens as a slide-over sheet on mobile.
- **Store navigation:** Dashboard, Customers, Orders, Products, Staff, Analytics, Settings and Help, with expandable sub-menus (List and Create), active-page highlighting and breadcrumbs in the header.
- **User menu** in the sidebar footer, with Profile, Billing, Team members and Log out.
- **"Coming soon" pages.** Every sidebar link has a real URL. Only the dashboard is built so far, so the rest show a placeholder page. Edit, Delete and Details have pages (for example `/customers/edit`, `/customers/delete` and `/customers/details`, and the same for orders, products and staff) but no sidebar link, because they need a record. They will be reached from the rows of each list page. Unknown URLs still return a 404.

### Dashboard

An ecommerce overview at `/dashboard`, with loading skeletons and a retry button if a widget fails to load:

- **Metric cards:** total revenue, orders, new customers and average order value, each with the change versus the previous period.
- **Sales overview:** an ApexCharts revenue and orders chart with a 7 days / 30 days / 12 months switcher. It follows the light and dark theme.
- **Recent orders** in a TanStack Table, with customer, product, status badge, amount and time.
- **New customers**, **recent activity** (orders, sign-ups, reviews, refunds, low stock) and **recently added products** with stock status.
- **Reminders** you can check off. Check marks are not saved yet.

### Mock API

All data is generated with faker, so there is no database.

- `server/api/auth/` backs the forms: `login`, `register`, `forgot-password` and `logout`. Request bodies are validated with the same zod schemas the forms use (`shared/utils/auth-schemas.ts`).
- `server/api/dashboard/` feeds the dashboard: `stats`, `sales?range=7d|30d|12m`, `orders`, `products`, `customers` (each with an optional `limit`), `activity` and `reminders`. Invalid query values return a 400.
- The dashboard data is seeded, so it looks the same on every load. Responses include a short artificial delay so the loading states are visible.

### General

- Light and dark mode, with a toggle on every page.
- Responsive layouts that work down to phone width.

## Roadmap

- [x] **Authentication**: login, register, forgot password, route protection, idle sign-out
- [x] **Dashboard shell**: sidebar, header, profile menu and navigation
- [x] **Mock data and dashboard widgets**: metric cards, sales chart, recent orders, customers, activity, products and reminders
- [ ] **Real pages for the sidebar links**: customers, orders, products, staff, analytics, settings (currently "coming soon" pages)

## Tech stack

- [Nuxt 4](https://nuxt.com) with Vue 3, running on [Bun](https://bun.sh)
- [UI Thing](https://uithing.com) components (Reka UI, tailwind-variants), [Tailwind CSS v4](https://tailwindcss.com)
- [vee-validate](https://vee-validate.logaretm.com) + [zod](https://zod.dev) for forms
- [VueUse](https://vueuse.org) (`useIdle` and others), [vue-sonner](https://vue-sonner.vercel.app) for toasts
- [ApexCharts](https://apexcharts.com) and [TanStack Table](https://tanstack.com/table) (UI Thing components) for charts and tables
- [@faker-js/faker](https://fakerjs.dev) for mock data
- [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for linting and formatting

## Getting started

```bash
bun install
bun run dev
```

The app runs at `http://localhost:3000`. Sign in with the demo account above, or click **Fill demo credentials**.

### Scripts

| Script              | What it does                                 |
| ------------------- | -------------------------------------------- |
| `bun run dev`       | Start the dev server                         |
| `bun run build`     | Build for production                         |
| `bun run preview`   | Preview the production build                 |
| `bun run lint`      | Lint with oxlint (`lint:fix` to fix)         |
| `bun run format`    | Format with oxfmt (`format:check` to verify) |
| `bun run typecheck` | Type-check the app, server and Vue files     |

### Configuration

| Variable                      | Default          | Description                                           |
| ----------------------------- | ---------------- | ----------------------------------------------------- |
| `NUXT_PUBLIC_IDLE_TIMEOUT_MS` | `300000` (5 min) | Inactivity time before a signed-in user is signed out |

## Project structure

```
app/
  components/
    App/             Sidebar and header for the admin layout
    Dashboard/       Dashboard widgets (stat cards, sales chart, tables, feeds)
    Ui/              UI Thing components (generated, safe to edit)
  composables/       useAuth: session, login, register, logout
  layouts/           auth (centered card) and default (admin layout with sidebar)
  middleware/        auth.global.ts: route protection and last-visited redirect
  pages/             login, register, forgot-password, dashboard
  placeholders/      the shared "coming soon" page
  plugins/           idle-logout.client.ts
  utils/             navigation.ts (sidebar links and routes), format helpers
server/
  api/auth/          mock auth endpoints
  api/dashboard/     mock dashboard data
  utils/             faker helpers, seeded mock data and request validation
shared/              zod schemas and types used by both the app and the server
```

## Contributing

Git hooks (husky) run on every commit:

- **pre-commit** runs lint-staged, which lints and formats the staged files.
- **commit-msg** runs commitlint, so commit messages must follow [Conventional Commits](https://www.conventionalcommits.org) (for example `feat: add sidebar`).

Add components with the UI Thing CLI, for example `bunx --bun ui-thing@latest add button`.
