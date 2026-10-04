# The mock API

[Back to the README](../README.md)

All data is generated with faker, so there is no database. The store holds 48 customers, 60 products, 120 orders, 12 staff members, 6 invitations, 5 notifications, 5 reminders, the store settings, 4 signed-in devices, a demo subscription with 12 invoices and 3 support requests, and lives in server memory.

- Every `/api` route needs the session cookie (401 otherwise) except `server/api/auth/`, which backs the forms: `login` (a team member's email signs in with their role), `register`, `forgot-password` and `logout`. Routes also check the role (403).
- `server/api/search` (`?q=`, 2 to 50 characters) returns the top 5 customers, orders, products and team members for the command palette, leaving out what the role may not read.
- `server/api/notifications/` has `GET` (the newest 30 for your role and the unread count), `POST read-all` and `POST /:id/read`.
- `server/api/<resource>/` (`customers`, `orders`, `products`, `staff`) is one set of routes for all four resources: `GET /api/<resource>` (with `page`, `pageSize`, `search`, `sort`, `order` and filters like `status`, `category`, `role` or `customerId`), `POST /api/<resource>`, `GET /api/<resource>/export` (the list as a CSV file), `POST /api/<resource>/bulk` (`{ action: "delete" | "update", ids, status }`, up to 100 ids, returning how many worked and why the others didn't), and `GET`, `PUT` (partial updates) and `DELETE` on `/api/<resource>/<id>`. Request bodies are validated with the same zod schemas the forms use (`shared/utils/`). Invalid input returns a 400 with field errors, and unknown ids a 404.
- `server/api/analytics/` feeds the analytics pages: `overview?range=`, `statistics` and `trends?metric=&range=&compare=`. Invalid query values return a 400.
- `server/api/team/invitations/` handles invitations: `GET` (optionally `?status=`), `POST` to invite (409 for an existing member or a pending invitation), `DELETE /:id` to cancel, `POST /:id/resend` and `POST /:id/accept` (demo only).
- `server/api/account/` backs the profile page: `PUT profile` and `POST password` (validated, and 400 on invalid input), plus `GET sessions`, `DELETE sessions/:id` and `DELETE sessions/others`.
- `server/api/settings/` has `GET` and `PUT` for the store settings and `POST reset` to restore the sample data.
- `server/api/billing/` backs the billing page: `GET` (plan, usage and cards), `PUT subscription` (409 if the store uses more than the plan allows), `POST subscription/cancel` and `subscription/resume`, `POST payment-methods/:id/default`, `GET invoices` (optionally `?status=`) and `GET invoices/:id` (a printable page, or a download with `?download=1`).
- `server/api/support/tickets/` has `GET` and `POST` (validated) for support requests, and `POST /:id/close`.
- `server/api/dashboard/` feeds the dashboard: `stats`, `sales?range=7d|30d|12m` and `activity` are seeded, `reminders` are kept in the store (`GET`, `POST`, `PUT` and `DELETE /:id`), and `orders`, `products` and `customers` return the newest records from the store.
- Responses include a short artificial delay so the loading states are visible.
