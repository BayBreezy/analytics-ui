# Features

What the app does today. [Back to the README](../README.md).

[Authentication](#authentication) · [Admin layout](#admin-layout) · [Dashboard](#dashboard) · [Customers and the rest](#customers-orders-products-and-staff) · [Analytics](#analytics) · [Team members](#team-members) · [Profile](#profile) · [Settings](#settings) · [Billing](#billing) · [Help](#help) · [General](#general)

## Authentication

Sign-in is a demo. There are no real passwords, the session cookie is not signed, and no email is sent. It's meant to exercise the UI and the app's routing, not to be secure.

- **Login, register and forgot-password pages**, with inline validation (zod + vee-validate), loading states, error alerts and toast notifications.
- **Password fields** have a show/hide toggle. The register form also shows a live strength meter and requirements list.
- **"Fill demo" buttons** on the login and register pages fill the form with demo data, so you can try the app in one click.
- **Remember me.** When checked, you stay signed in for 30 days. Otherwise the session ends when the browser closes.
- **Protected routes.** A global route middleware sends signed-out users to `/login`. It runs on the server too, so protected content never flashes.
- **Returns you where you were.** After signing in you land on the last page you visited (falling back to `/dashboard`). Signed-in users who open `/login`, `/register` or `/forgot-password` are redirected away from them. Unknown URLs (for example `/sw.js` requested by a browser extension) are never remembered as a destination.
- **Automatic sign-out when idle.** After 5 minutes without mouse, keyboard, scroll or touch activity you are signed out and shown a toast. Activity in any open tab counts, so using one tab won't sign you out of another. The timeout is configurable: pick 1, 5, 15 or 30 minutes (or never) under **Settings → Security**, and the app default is set with an environment variable (see [Configuration](../README.md#configuration)).

**Demo account:** `demo@analytics.test` / `password123`, an admin. Any other well-formed email and a password of 8+ characters will also sign you in as an admin, unless the email belongs to a team member (see [Roles](roles.md)).

## Admin layout

![The command palette](screenshots/command-palette.jpg)

- **Collapsible sidebar** built with UI Thing's Sidebar. It collapses to an icon rail (with tooltips), remembers its state in a cookie, toggles with `Ctrl/Cmd + B`, and opens as a slide-over sheet on mobile.
- **Store navigation:** Dashboard, Customers, Orders, Products, Staff, Analytics, Settings and Help, with expandable sub-menus (List and Create), active-page highlighting and breadcrumbs in the header.
- **User menu** in the sidebar footer, with your role, Profile, Billing, Team members and Log out (only the pages your role may open are listed).
- **Notification bell** in the header with an unread count. New orders, new customers, products dropping below 20 in stock and accepted invitations add a notification, and you can open it, or mark everything as read. It looks again every 30 seconds, when the window is focused and when you change page. Read state is shared by everyone in this demo.
- **Command palette:** press `Ctrl/Cmd + K` (or `/`, or use the Search button in the header) to jump to any page you may open, start a New customer, order or product, switch between light and dark mode, log out, or search customers, orders, products and team members by name, email, order number or SKU. Arrow keys and Enter pick a result.
- **Keyboard shortcuts:** `G` then `D`, `O`, `C`, `P` or `S` jumps to the dashboard, orders, customers, products or staff, and `?` opens the shortcut list. They are ignored while you type in a field or when a dialog is open.
- Unknown URLs (such as `/sw.js`) get a friendly 404 page, with a real 404 status. Any other error gets an error page too, and a page that fails while rendering shows a retry inside the layout, so the sidebar keeps working.

## Dashboard

![The dashboard in dark mode](screenshots/dashboard-dark.jpg)

An ecommerce overview at `/dashboard`, with loading skeletons and a retry button if a widget fails to load:

- **Metric cards:** total revenue, orders, new customers and average order value, each with the change versus the previous period.
- **Sales overview:** an ApexCharts revenue and orders chart with a 7 days / 30 days / 12 months switcher. It follows the light and dark theme.
- **Recent orders** in a TanStack Table, with customer, product, status badge, amount and time.
- **New customers**, **recent activity** (orders, sign-ups, reviews, refunds, low stock) and **recently added products** with stock status.
- **Reminders** you can check off, add and delete. They are saved in server memory, and a failed save puts the change back.

## Customers, orders, products and staff

![Customers, with two rows selected for a bulk action](screenshots/customers.jpg)

Each of the four has the same set of pages, opened from the sidebar:

- **List** with search, sortable columns, filters, pagination and a row menu (View, Edit, Delete). The search, sort, filters and page live in the URL, so you can reload, go back or share the link and get the same view.
- **Create** and **Edit** forms with inline validation (zod + vee-validate). Details (`/customers/<id>`) and edit (`/customers/<id>/edit`) pages are opened from the list rows.
- **Details** pages: a customer's profile and recent orders, an order's items, totals and customer, a product's price and stock, a team member's profile.
- **Delete** asks for confirmation, from the list and from the details page.
- **Export CSV** downloads everything that matches the search and filters on screen (not just the current page), in the current sort order. Spreadsheet formulas in cell values are defused.
- **Bulk actions:** tick rows (or the header checkbox for the whole page) to set their status or delete them together. A bar shows how many are selected. If some can't be changed, for example the last admin, the rest still go through and the message says why. Selection is per page and clears when the page, search or filters change.
- **Orders** have multiple line items (add and remove rows, with a live total). The customer and product pickers are searchable and load matches from the API as you type, so they stay short however many records there are, and a quick "Update status" menu on the details page. A customer's "View all" link opens the orders list filtered to that customer.
- Everything you create, edit or delete shows up straight away in the lists and on the dashboard (for example under "Recently added products"). Changes are kept in server memory and reset when the dev server restarts.

## Analytics

![The statistics page](screenshots/statistics.jpg)

Three pages under **Analytics** in the sidebar. The breakdowns are worked out from the same orders, customers and products you see in the rest of the app. The time series (revenue, orders, new customers) are seeded mock data, so their totals won't match the orders list exactly.

- **Overview:** key metrics (revenue, average order value, conversion rate, repeat customers) with the change versus the previous period, revenue compared with the period before, sales by category and the top products. A 7 days / 30 days / 12 months switcher is kept in the URL.
- **Statistics:** revenue by category, orders by status, when customers order (weekday and time of day), customer loyalty, the top customers and stock health.
- **Trends:** pick a metric (revenue, orders, new customers, average order), a range and optionally compare with the previous period. The chart adds a moving average, with summary tiles (total, average, best and slowest period) and period-over-period growth. All choices are kept in the URL.
- Charts follow light and dark mode.

## Team members

![The team page](screenshots/team.jpg)

`/account/team` (from the user menu, for admins) shows your staff as a team, with search and a role filter.

- **Invite a member** by email, with a role and an optional message. An email that is already on the team, or already has a pending invitation, is rejected.
- **Invitations** are listed with their status (pending, accepted, cancelled or expired) and can be resent, copied as a link or cancelled. No email is sent. "Mark as accepted (demo)" pretends the invited person accepted, which adds them to the team.
- **Members** can have their role changed, be deactivated and reactivated, or be removed. The last active admin can't be removed, demoted or deactivated.

## Profile

`/account/profile` (from the user menu) is where you manage your own account.

- **Personal info:** name, email, job title, phone, bio and an avatar picked from a gallery (there are no uploads). Saving updates the sidebar straight away. The profile is kept in your session cookie, so it keeps the same lifetime as your sign-in ("Remember me" or the browser session).
- **Password:** current, new and confirm fields with the same strength meter as registration. It is a demo, so there is no real password to check against and any valid change succeeds.
- **Active sessions:** a list of signed-in devices (sample data). Sign out one device, or all the others. The device you are on can't be signed out from the list.
- **Delete account** signs you out. Nothing is stored on the server, so there is nothing else to delete.

## Settings

`/settings` has five tabs, kept in the URL (`?tab=`).

- **General:** store name, support email and timezone. The store name shows in the sidebar and the browser tab title. These are saved in server memory and reset when the dev server restarts.
- **Appearance:** light, dark or system theme, and the default number of rows per page in lists (a page size picked in the list itself still wins). Both are saved in this browser.
- **Notifications:** email and in-app switches for new orders, low stock, new customers, the weekly report and team invitations. The choices are saved. No emails are sent, but the in-app switches decide which events show up in the notification bell.
- **Security:** how long until you are signed out for being idle (1, 5, 15 or 30 minutes, or never). Saved in this browser and applied straight away.
- **Data:** reset the demo data. This replaces every customer, order, product, team change, setting and session with the original sample data. Your own account and this browser's preferences are kept.

## Billing

![The billing page](screenshots/billing.jpg)

`/account/billing` (from the user menu) shows a demo subscription. Nothing is ever charged and no real card numbers are asked for or stored.

- **Plan and usage:** your plan, price and renewal date, with meters for products, team members and orders in the last 30 days, worked out from the store and measured against the plan's limits. The meters turn amber at 80% and red at the limit.
- **Change plan:** pick Starter, Growth or Scale, billed monthly or yearly (two months free). A plan can't be chosen if you already use more than it allows. Changing plan adds an invoice.
- **Cancel and keep:** cancelling lets the plan run until the end of the period, and "Keep my plan" undoes it.
- **Payment method:** choose which of three demo cards is the default.
- **Invoices:** a table of your billing history with status badges. Each invoice can be opened as a printable page or downloaded.

## Help

`/help` has four tabs, kept in the URL (`?tab=`).

- **FAQ:** questions grouped by topic, with a search box that filters them and opens the matching answers.
- **Contact support:** send a message with a category and priority, and see your requests with their status. You can close a request. This is a demo, so nobody replies.
- **Shortcuts:** the keyboard shortcuts above.
- **What's new:** a timeline of what has been added to the app.

## General

- Light and dark mode, with a toggle on every page.
- Responsive layouts that work down to phone width.

See also: [roles and permissions](roles.md), [the mock API](api.md).
