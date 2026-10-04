import { describe, expect, it } from "vitest";
import {
  PERMISSIONS,
  ROLES,
  hasPermission,
  isRole,
  resourcePermission,
} from "../../shared/utils/permissions";

const MANAGER = [
  "customers:write",
  "orders:write",
  "products:write",
  "staff:read",
  "analytics:read",
];

describe("hasPermission", () => {
  it("lets an admin do everything", () => {
    for (const permission of PERMISSIONS) expect(hasPermission("admin", permission)).toBe(true);
  });

  it("gives a manager the store and analytics, but not the team, billing or settings", () => {
    for (const permission of PERMISSIONS) {
      expect(hasPermission("manager", permission), permission).toBe(MANAGER.includes(permission));
    }
  });

  it("lets support work on orders and nothing else", () => {
    for (const permission of PERMISSIONS) {
      expect(hasPermission("support", permission), permission).toBe(permission === "orders:write");
    }
  });

  it("lets unknown roles and missing users do nothing", () => {
    for (const role of ["staff", "owner", "", null, undefined, 42]) {
      for (const permission of PERMISSIONS) expect(hasPermission(role, permission)).toBe(false);
    }
  });

  it("keeps the manager and support lists inside the admin list", () => {
    for (const role of ROLES) {
      for (const permission of PERMISSIONS) {
        if (hasPermission(role, permission)) expect(hasPermission("admin", permission)).toBe(true);
      }
    }
  });
});

describe("isRole", () => {
  it("accepts the three roles only", () => {
    expect(ROLES.every(isRole)).toBe(true);
    expect(isRole("staff")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});

describe("resourcePermission", () => {
  it("needs a write permission per resource", () => {
    expect(resourcePermission("customers", "write")).toBe("customers:write");
    expect(resourcePermission("orders", "write")).toBe("orders:write");
    expect(resourcePermission("products", "write")).toBe("products:write");
    expect(resourcePermission("staff", "write")).toBe("staff:write");
  });

  it("only restricts reading the staff list", () => {
    expect(resourcePermission("staff", "read")).toBe("staff:read");
    expect(resourcePermission("customers", "read")).toBeUndefined();
    expect(resourcePermission("orders", "read")).toBeUndefined();
    expect(resourcePermission("products", "read")).toBeUndefined();
  });
});
