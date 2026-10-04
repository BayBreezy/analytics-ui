import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const sidebar = (page: Page) => page.locator("[data-slot='sidebar']").first();
const userMenu = async (page: Page) => {
  await page.locator("[data-slot='sidebar-footer'] button").first().click();
  return page.getByRole("menu");
};

test.describe("support", () => {
  test.beforeEach(async ({ signInAs, app }) => {
    await signInAs("support");
    await app.goto("/dashboard");
  });

  test("sees customers, orders and products but not staff or analytics", async ({ page }) => {
    const nav = sidebar(page);
    for (const item of ["Customers", "Orders", "Products", "Settings", "Help"])
      await expect(nav).toContainText(item);
    await expect(nav).not.toContainText("Staff");
    await expect(nav).not.toContainText("Insights");
  });

  test("has a user menu with the role, Profile and no Billing or Team members", async ({
    page,
  }) => {
    const menu = await userMenu(page);
    await expect(menu).toContainText(/support/i);
    await expect(menu).toContainText("Profile");
    await expect(menu).not.toContainText("Billing");
    await expect(menu).not.toContainText("Team members");
  });

  for (const path of [
    "/staff",
    "/staff/create",
    "/analytics",
    "/analytics/trends",
    "/account/billing",
    "/account/team",
    "/customers/create",
    "/products/create",
  ]) {
    test(`is sent from ${path} to the dashboard, with a message`, async ({ page, app }) => {
      await app.goto(path);
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByText("You don't have access to that page")).toBeVisible();
    });
  }

  test("can work on orders: create, edit and the status menu", async ({ page, app }) => {
    await app.goto("/orders");
    await expect(page.getByRole("link", { name: /New order/ })).toBeVisible();
    await app.goto("/orders/ord_4821");
    await expect(page.getByRole("button", { name: "Update status" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit" })).toBeVisible();
  });

  test("can't create or change customers", async ({ page, app }) => {
    await app.goto("/customers");
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /New customer/ })).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: "Select all on this page" })).toHaveCount(0);
    await page
      .getByRole("button", { name: /Actions for/ })
      .first()
      .click();
    await expect(page.getByRole("menuitem")).toHaveText(["View"]);
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: /Actions for/ })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "View" }).click();
    await expect(page).toHaveURL(/\/customers\/cus_/);
    await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
  });

  test("only gets the per-browser settings", async ({ page, app }) => {
    await app.goto("/settings");
    await expect(page.getByRole("tab")).toHaveText(["Appearance", "Security"]);
    await app.goto("/settings?tab=data");
    await expect(page.getByText("Theme")).toBeVisible();
    await expect(page.getByText("Reset demo data")).toHaveCount(0);
  });

  test("keeps Help, Profile and the dashboard", async ({ page, app }) => {
    await app.goto("/help");
    await expect(page.getByRole("heading", { name: "Help", exact: true })).toBeVisible();
    await app.goto("/account/profile");
    await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
    await app.goto("/dashboard");
    await expect(page.getByText("Total revenue")).toBeVisible();
  });
});

test.describe("manager", () => {
  test.beforeEach(async ({ signInAs, app }) => {
    await signInAs("manager");
    await app.goto("/dashboard");
  });

  test("sees staff and analytics, but not billing or team", async ({ page }) => {
    await expect(sidebar(page)).toContainText("Staff");
    await expect(sidebar(page)).toContainText("Analytics");
    const menu = await userMenu(page);
    await expect(menu).toContainText(/manager/i);
    await expect(menu).not.toContainText("Billing");
    await expect(menu).not.toContainText("Team members");
  });

  test("can read the staff list but not change it", async ({ page, app }) => {
    await app.goto("/staff");
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /New staff/ })).toHaveCount(0);
    await page
      .getByRole("button", { name: /Actions for/ })
      .first()
      .click();
    await expect(page.getByRole("menuitem")).toHaveText(["View"]);
  });

  for (const path of ["/staff/create", "/account/team", "/account/billing"]) {
    test(`is sent from ${path} to the dashboard`, async ({ page, app }) => {
      await app.goto(path);
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  }

  test("can use analytics and change customers", async ({ page, app }) => {
    await app.goto("/analytics/trends");
    await expect(page).toHaveURL(/\/analytics\/trends$/);
    await app.goto("/customers");
    await expect(page.getByRole("link", { name: /New customer/ })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Select all on this page" })).toBeVisible();
  });
});

test.describe("admin", () => {
  test.beforeEach(async ({ signInAs, app }) => {
    await signInAs("admin");
    await app.goto("/dashboard");
  });

  test("sees everything", async ({ page }) => {
    for (const item of [
      "Customers",
      "Orders",
      "Products",
      "Staff",
      "Analytics",
      "Settings",
      "Help",
    ])
      await expect(sidebar(page)).toContainText(item);
    const menu = await userMenu(page);
    await expect(menu).toContainText(/admin/i);
    for (const item of ["Profile", "Billing", "Team members"])
      await expect(menu).toContainText(item);
  });

  test("can open every restricted page, and all five settings tabs", async ({ page, app }) => {
    for (const path of [
      "/account/billing",
      "/account/team",
      "/staff",
      "/staff/create",
      "/analytics/statistics",
    ]) {
      await app.goto(path);
      await expect(page, path).toHaveURL(new RegExp(`${path}$`));
    }
    await app.goto("/settings");
    await expect(page.getByRole("tab")).toHaveCount(5);
  });
});

test.describe("last visited page", () => {
  test("is not used when the next person can't open it", async ({
    page,
    app,
    signInAs,
    sessions,
  }) => {
    await signInAs("admin");
    await app.goto("/account/billing");
    await page.locator("[data-slot='sidebar-footer'] button").first().click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.getByLabel("Email address").fill(sessions.emails.support);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
