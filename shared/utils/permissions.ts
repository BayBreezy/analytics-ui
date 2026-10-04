/**
 * What each role may do. This file is plain data and functions (no Vue or Nuxt auto-imports), so
 * `nuxt.config.ts` and `app/utils/navigation.ts` can import it. Everything not listed here (reading
 * customers, orders and products, the dashboard, your own profile) is open to every role.
 */
export const ROLES = ["admin", "manager", "support"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "customers:write",
  "orders:write",
  "products:write",
  "staff:read",
  "staff:write",
  "analytics:read",
  "team:manage",
  "billing:manage",
  "settings:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: PERMISSIONS,
  manager: ["customers:write", "orders:write", "products:write", "staff:read", "analytics:read"],
  support: ["orders:write"],
};

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && (ROLES as readonly string[]).includes(value);

/** Whether a role may do something. Unknown roles may do nothing. */
export const hasPermission = (role: unknown, permission: Permission) =>
  isRole(role) && ROLE_PERMISSIONS[role].includes(permission);

/** The permission needed to read or write a store resource, if it needs one. */
export const resourcePermission = (
  resource: "customers" | "orders" | "products" | "staff",
  action: "read" | "write"
): Permission | undefined =>
  action === "write" ? `${resource}:write` : resource === "staff" ? "staff:read" : undefined;
