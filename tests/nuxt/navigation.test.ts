import { describe, expect, it } from "vitest";
import {
  DASHBOARD_URL,
  getBreadcrumbs,
  getNavPages,
  getPageTitle,
  hasActiveChild,
  isActive,
  mainNav,
  matchRecordRoute,
  visibleNav,
} from "../../app/utils/navigation";
import { hasPermission } from "../../shared/utils/permissions";

const canAs = (role: string) => (permission: Parameters<typeof hasPermission>[1]) =>
  hasPermission(role, permission);
const labels = (path: string) => getBreadcrumbs(path).map((crumb) => crumb.label);

describe("getBreadcrumbs", () => {
  it("shows just Dashboard on the dashboard", () => {
    expect(getBreadcrumbs("/dashboard")).toEqual([{ label: "Dashboard" }]);
  });

  it("builds Dashboard > Section > Page, linking all but the last", () => {
    expect(getBreadcrumbs("/customers/create")).toEqual([
      { label: "Dashboard", link: DASHBOARD_URL },
      { label: "Customers", link: "/customers" },
      { label: "Create" },
    ]);
    expect(labels("/analytics/trends")).toEqual(["Dashboard", "Analytics", "Trends"]);
  });

  it("shows one section crumb for a page with no sub-pages", () => {
    expect(labels("/account/team")).toEqual(["Dashboard", "Team members"]);
    expect(labels("/settings")).toEqual(["Dashboard", "Settings"]);
    expect(labels("/analytics")).toEqual(["Dashboard", "Analytics"]);
  });

  it("covers the pages that need a record", () => {
    expect(getBreadcrumbs("/customers/cus_1001")).toEqual([
      { label: "Dashboard", link: DASHBOARD_URL },
      { label: "Customers", link: "/customers" },
      { label: "Details" },
    ]);
    expect(getBreadcrumbs("/orders/ord_4821/edit")).toEqual([
      { label: "Dashboard", link: DASHBOARD_URL },
      { label: "Orders", link: "/orders" },
      { label: "Details", link: "/orders/ord_4821" },
      { label: "Edit" },
    ]);
  });

  it("ignores a trailing slash and falls back to Dashboard for unknown paths", () => {
    expect(labels("/customers/")).toEqual(["Dashboard", "Customers"]);
    expect(labels("/nowhere")).toEqual(["Dashboard"]);
  });
});

describe("getPageTitle", () => {
  it("names pages from the navigation", () => {
    expect(getPageTitle("/dashboard")).toBe("Dashboard");
    expect(getPageTitle("/customers/create")).toBe("Customers: Create");
    expect(getPageTitle("/analytics")).toBe("Analytics");
    expect(getPageTitle("/analytics/statistics")).toBe("Analytics: Statistics");
    expect(getPageTitle("/account/billing")).toBe("Billing");
  });

  it("names record pages", () => {
    expect(getPageTitle("/customers/cus_1001")).toBe("Customer details");
    expect(getPageTitle("/customers/cus_1001/edit")).toBe("Edit customer");
    expect(getPageTitle("/staff/stf_301")).toBe("Staff member details");
  });

  it("falls back to Page", () => {
    expect(getPageTitle("/nowhere")).toBe("Page");
  });
});

describe("matchRecordRoute", () => {
  it("recognises details and edit pages of a resource", () => {
    expect(matchRecordRoute("/orders/ord_4821")).toEqual({
      name: "orders",
      id: "ord_4821",
      view: "details",
    });
    expect(matchRecordRoute("/products/prd_2001/edit")).toEqual({
      name: "products",
      id: "prd_2001",
      view: "edit",
    });
  });

  it("ignores everything else", () => {
    expect(matchRecordRoute("/customers")).toBeUndefined();
    expect(matchRecordRoute("/dashboard/overview")).toBeUndefined();
    expect(matchRecordRoute("/orders/ord_1/edit/extra")).toBeUndefined();
  });
});

describe("isActive and hasActiveChild", () => {
  it("matches exactly or, for sections, anything inside", () => {
    expect(isActive("/customers", "/customers")).toBe(true);
    expect(isActive("/customers/cus_1", "/customers")).toBe(true);
    expect(isActive("/customers/cus_1", "/customers", true)).toBe(false);
    expect(isActive("/customer", "/customers")).toBe(false);
    expect(isActive("/customers/", "/customers", true)).toBe(true);
  });

  it("never treats the dashboard as a section", () => {
    expect(isActive("/dashboard", "/dashboard")).toBe(true);
    expect(isActive("/dashboard/anything", "/dashboard")).toBe(false);
  });

  it("finds the active child of a menu", () => {
    const analytics = mainNav
      .flatMap((group) => group.items)
      .find((item) => item.url === "/analytics")!;
    expect(hasActiveChild("/analytics/trends", analytics)).toBe(true);
    expect(hasActiveChild("/customers", analytics)).toBe(false);
  });
});

describe("visibleNav", () => {
  const titles = (role: string) =>
    mainNav.flatMap((group) => visibleNav(group.items, canAs(role))).map((item) => item.title);

  it("shows an admin everything", () => {
    expect(titles("admin")).toEqual([
      "Dashboard",
      "Customers",
      "Orders",
      "Products",
      "Staff",
      "Analytics",
    ]);
  });

  it("hides staff and analytics from support, and staff creation from managers", () => {
    expect(titles("support")).toEqual(["Dashboard", "Customers", "Orders", "Products"]);
    expect(titles("manager")).toContain("Staff");
    const staff = mainNav
      .flatMap((group) => visibleNav(group.items, canAs("manager")))
      .find((item) => item.title === "Staff")!;
    expect(staff.children?.map((child) => child.title)).toEqual(["List"]);
  });

  it("hides the Create sub-page from roles that can't write", () => {
    const customers = mainNav
      .flatMap((group) => visibleNav(group.items, canAs("support")))
      .find((item) => item.title === "Customers")!;
    expect(customers.children?.map((child) => child.title)).toEqual(["List"]);
  });
});

describe("getNavPages", () => {
  it("lists every page an admin may open once, with full titles", () => {
    const pages = getNavPages(canAs("admin"));
    const urls = pages.map((page) => page.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toEqual(
      expect.arrayContaining([
        "/dashboard",
        "/customers",
        "/customers/create",
        "/analytics/trends",
        "/staff",
        "/settings",
        "/help",
        "/account/profile",
        "/account/billing",
        "/account/team",
      ])
    );
    expect(pages.find((page) => page.url === "/customers/create")?.title).toBe("Customers: Create");
  });

  it("leaves out what the role may not open", () => {
    const urls = getNavPages(canAs("support")).map((page) => page.url);
    expect(urls).not.toContain("/staff");
    expect(urls).not.toContain("/analytics/trends");
    expect(urls).not.toContain("/account/billing");
    expect(urls).not.toContain("/account/team");
    expect(urls).not.toContain("/customers/create");
    expect(urls).toContain("/orders/create");
    expect(urls).toContain("/account/profile");
  });
});
