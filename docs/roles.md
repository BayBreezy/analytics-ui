# Roles and permissions

[Back to the README](../README.md)

The three team roles decide what you can do. Sign in with a team member's email (any password) to try one: the emails are on the Staff list, and the sidebar and user menu show your role.

| Role        | Can do                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| **Admin**   | Everything, including the team, billing, store settings and the data reset                                         |
| **Manager** | Create, edit and delete customers, orders and products, and use analytics. Sees the staff list but can't change it |
| **Support** | See customers, orders, products and the dashboard, and work on orders                                              |

Everyone can use the dashboard, their own profile, Help, the per-browser settings (appearance and sign-out time) and the notification bell. Pages a role can't open are left out of the navigation, and typing the URL sends you to the dashboard with a message. The API checks the same rules (401 without a session, 403 for the wrong role). Deactivated team members can't sign in. This is a demo with an unsigned cookie, so it shows how a permission system works, it isn't security.
