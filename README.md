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
- **"Coming soon" pages.** Settings, Help, Profile and Billing have real URLs but only show a placeholder for now. Unknown URLs still return a 404.

### Dashboard

An ecommerce overview at `/dashboard`, with loading skeletons and a retry button if a widget fails to load:

- **Metric cards:** total revenue, orders, new customers and average order value, each with the change versus the previous period.
- **Sales overview:** an ApexCharts revenue and orders chart with a 7 days / 30 days / 12 months switcher. It follows the light and dark theme.
- **Recent orders** in a TanStack Table, with customer, product, status badge, amount and time.
- **New customers**, **recent activity** (orders, sign-ups, reviews, refunds, low stock) and **recently added products** with stock status.
- **Reminders** you can check off. Check marks are not saved yet.

### Customers, orders, products and staff

Each of the four has the same set of pages, opened from the sidebar:

- **List** with search, sortable columns, filters, pagination and a row menu (View, Edit, Delete). The search, sort, filters and page live in the URL, so you can reload, go back or share the link and get the same view.
- **Create** and **Edit** forms with inline validation (zod + vee-validate). Details (`/customers/<id>`) and edit (`/customers/<id>/edit`) pages are opened from the list rows.
- **Details** pages: a customer's profile and recent orders, an order's items, totals and customer, a product's price and stock, a team member's profile.
- **Delete** asks for confirmation, from the list and from the details page.
- **Orders** have multiple line items (add and remove rows, with a live total). The customer and product pickers are searchable and load matches from the API as you type, so they stay short however many records there are, and a quick "Update status" menu on the details page. A customer's "View all" link opens the orders list filtered to that customer.
- Everything you create, edit or delete shows up straight away in the lists and on the dashboard (for example under "Recently added products"). Changes are kept in server memory and reset when the dev server restarts.

### Analytics

Three pages under **Analytics** in the sidebar. The breakdowns are worked out from the same orders, customers and products you see in the rest of the app. The time series (revenue, orders, new customers) are seeded mock data, so their totals won't match the orders list exactly.

- **Overview:** key metrics (revenue, average order value, conversion rate, repeat customers) with the change versus the previous period, revenue compared with the period before, sales by category and the top products. A 7 days / 30 days / 12 months switcher is kept in the URL.
- **Statistics:** revenue by category, orders by status, when customers order (weekday and time of day), customer loyalty, the top customers and stock health.
- **Trends:** pick a metric (revenue, orders, new customers, average order), a range and optionally compare with the previous period. The chart adds a moving average, with summary tiles (total, average, best and slowest period) and period-over-period growth. All choices are kept in the URL.
- Charts follow light and dark mode.

### Team members

`/account/team` (from the user menu) shows your staff as a team, with search and a role filter.

- **Invite a member** by email, with a role and an optional message. An email that is already on the team, or already has a pending invitation, is rejected.
- **Invitations** are listed with their status (pending, accepted, cancelled or expired) and can be resent, copied as a link or cancelled. No email is sent. "Mark as accepted (demo)" pretends the invited person accepted, which adds them to the team.
- **Members** can have their role changed, be deactivated and reactivated, or be removed. The last active admin can't be removed, demoted or deactivated.

### Mock API

All data is generated with faker, so there is no database. The store holds 48 customers, 60 products, 120 orders, 12 staff members and 6 invitations, and lives in server memory.

- `server/api/auth/` backs the forms: `login`, `register`, `forgot-password` and `logout`.
- `server/api/<resource>/` (`customers`, `orders`, `products`, `staff`) is one set of routes for all four resources: `GET /api/<resource>` (with `page`, `pageSize`, `search`, `sort`, `order` and filters like `status`, `category`, `role` or `customerId`), `POST /api/<resource>`, and `GET`, `PUT` (partial updates) and `DELETE` on `/api/<resource>/<id>`. Request bodies are validated with the same zod schemas the forms use (`shared/utils/`). Invalid input returns a 400 with field errors, and unknown ids a 404.
- `server/api/analytics/` feeds the analytics pages: `overview?range=`, `statistics` and `trends?metric=&range=&compare=`. Invalid query values return a 400.
- `server/api/team/invitations/` handles invitations: `GET` (optionally `?status=`), `POST` to invite (409 for an existing member or a pending invitation), `DELETE /:id` to cancel, `POST /:id/resend` and `POST /:id/accept` (demo only).
- `server/api/dashboard/` feeds the dashboard: `stats`, `sales?range=7d|30d|12m`, `activity` and `reminders` are seeded, and `orders`, `products` and `customers` return the newest records from the store.
- Responses include a short artificial delay so the loading states are visible.

### General

- Light and dark mode, with a toggle on every page.
- Responsive layouts that work down to phone width.

## Roadmap

- [x] **Authentication**: login, register, forgot password, route protection, idle sign-out
- [x] **Dashboard shell**: sidebar, header, profile menu and navigation
- [x] **Mock data and dashboard widgets**: metric cards, sales chart, recent orders, customers, activity, products and reminders
- [x] **Customers, orders, products and staff**: list, create, details, edit and delete, backed by an in-memory mock store
- [x] **Analytics and team members**: overview, statistics and trends pages, and a team page with invitations
- [ ] **Settings, Help, Profile and Billing** (currently "coming soon" pages)

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
    Analytics/       Chart card and the analytics charts and tables
    App/             Sidebar, header, error state and confirm dialog
    Customers/       List, Form and Details (same for Orders, Products and Staff)
    Dashboard/       Dashboard widgets (stat cards, sales chart, tables, feeds)
    Resource/        Generic list page, row actions, delete dialog, form shell and searchable select
    Team/            Members and invitations tabs and the invite dialog
    Ui/              UI Thing components (generated, safe to edit)
  composables/       useAuth, useChartColors, useQueryParam, useResourceList, useResourceForm, useResourceView
  layouts/           auth (centered card) and default (admin layout with sidebar)
  middleware/        auth.global.ts: route protection and last-visited redirect
  pages/             login, register, forgot-password, dashboard, analytics/*, account/team
  placeholders/      the shared "coming soon" page
  plugins/           idle-logout.client.ts
  resource-pages/    the generic list, create, details and edit pages
  utils/             navigation.ts (sidebar links and routes), format helpers
server/
  api/analytics/     mock analytics data
  api/auth/          mock auth endpoints
  api/[resource]/    list, create, get, update and delete for every resource
  api/dashboard/     mock dashboard data
  api/team/          invitations
  utils/             in-memory store, faker helpers and request validation
shared/              zod schemas, types and the resource registry used by app and server
```

## Contributing

Git hooks (husky) run on every commit:

- **pre-commit** runs lint-staged, which lints and formats the staged files.
- **commit-msg** runs commitlint, so commit messages must follow [Conventional Commits](https://www.conventionalcommits.org) (for example `feat: add sidebar`).

Add components with the UI Thing CLI, for example `bunx --bun ui-thing@latest add button`.
