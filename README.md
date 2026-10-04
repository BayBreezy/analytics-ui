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

### Mock API

Server routes under `server/api/auth/` back the forms: `login`, `register`, `forgot-password` and `logout`. Request bodies are validated with the same zod schemas the forms use (`shared/utils/auth-schemas.ts`), and responses include a short artificial delay so loading states are visible.

### General

- Light and dark mode, with a toggle on every page.
- Responsive layouts that work down to phone width.
- Placeholder `/dashboard` page that shows the signed-in user. The full dashboard is next on the [roadmap](#roadmap).

## Roadmap

- [x] **Authentication**: login, register, forgot password, route protection, idle sign-out
- [ ] **Dashboard shell**: sidebar, header, profile menu and navigation
- [ ] **Mock data and dashboard widgets**: stat cards, ApexCharts sales chart, TanStack Table of recent orders, customers and reminders
- [ ] **Real pages for the sidebar links**: customers, orders, products, staff, analytics, settings

## Tech stack

- [Nuxt 4](https://nuxt.com) with Vue 3, running on [Bun](https://bun.sh)
- [UI Thing](https://uithing.com) components (Reka UI, tailwind-variants), [Tailwind CSS v4](https://tailwindcss.com)
- [vee-validate](https://vee-validate.logaretm.com) + [zod](https://zod.dev) for forms
- [VueUse](https://vueuse.org) (`useIdle` and others), [vue-sonner](https://vue-sonner.vercel.app) for toasts
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
  components/Ui/     UI Thing components (generated, safe to edit)
  composables/       useAuth: session, login, register, logout
  layouts/           auth (centered card) and default
  middleware/        auth.global.ts: route protection and last-visited redirect
  pages/             login, register, forgot-password, dashboard
  plugins/           idle-logout.client.ts
server/
  api/auth/          mock auth endpoints
  utils/             faker helpers and request validation
shared/              zod schemas and types used by both the app and the server
```

## Contributing

Git hooks (husky) run on every commit:

- **pre-commit** runs lint-staged, which lints and formats the staged files.
- **commit-msg** runs commitlint, so commit messages must follow [Conventional Commits](https://www.conventionalcommits.org) (for example `feat: add sidebar`).

Add components with the UI Thing CLI, for example `bunx --bun ui-thing@latest add button`.
