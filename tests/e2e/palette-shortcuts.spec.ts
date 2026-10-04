import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const palette = (page: Page) => page.getByRole("dialog");
const input = (page: Page) => page.getByPlaceholder("Search pages, records and actions");
const row = (page: Page, name: string | RegExp) => palette(page).getByRole("option", { name });

test.describe("command palette", () => {
  test.beforeEach(async ({ signInAs, app }) => {
    await signInAs("admin");
    await app.goto("/dashboard");
  });

  test("opens from the header button with the pages and actions, and Escape closes it", async ({
    page,
  }) => {
    const button = page.getByRole("button", { name: "Search and run commands" }).first();
    await expect(button).toContainText(/⌘K|Ctrl K/);
    await button.click();
    await expect(palette(page)).toBeVisible();
    await expect(input(page)).toBeFocused();
    await expect(palette(page).getByText("Pages", { exact: true })).toBeVisible();
    await expect(palette(page).getByText("Actions", { exact: true })).toBeVisible();
    const names = await palette(page).getByRole("option").allInnerTexts();
    for (const expected of [
      "Dashboard",
      "Staff",
      "Analytics",
      "Billing",
      "Team members",
      "Settings",
      "Help",
    ])
      expect(
        names.some((name) => name.includes(expected)),
        expected
      ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(palette(page)).toHaveCount(0);
  });

  test("Ctrl+K toggles it, even from a field, and / opens it outside fields only", async ({
    page,
    app,
  }) => {
    await page.keyboard.press("Control+k");
    await expect(palette(page)).toBeVisible();
    await page.keyboard.press("Control+k");
    await expect(palette(page)).toHaveCount(0);

    await app.goto("/customers");
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    await page.getByRole("searchbox").click();
    await page.keyboard.press("Control+k");
    await expect(palette(page)).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByRole("searchbox").click();
    await page.keyboard.type("/");
    await expect(palette(page)).toHaveCount(0);
    await expect(page.getByRole("searchbox")).toHaveValue("/");
    await page.getByRole("searchbox").fill("");
    await page.locator("h1").click();
    await page.keyboard.press("/");
    await expect(palette(page)).toBeVisible();
  });

  test("filters pages and actions as you type, and an action navigates and closes it", async ({
    page,
  }) => {
    await page.keyboard.press("Control+k");
    await input(page).fill("new ord");
    await expect(row(page, "New order")).toBeVisible();
    await expect(row(page, "Staff")).toHaveCount(0);
    await row(page, "New order").click();
    await expect(page).toHaveURL(/\/orders\/create$/);
    await expect(palette(page)).toHaveCount(0);
  });

  test("searches records, shows them in groups, and opens one", async ({
    page,
    request,
    context,
  }) => {
    const customer = (await (await context.request.get("/api/customers?pageSize=1")).json())
      .items[0];
    await page.keyboard.press("Control+k");
    await input(page).fill(customer.name.split(" ")[0].slice(0, 5));
    await expect(palette(page).getByText("Customers", { exact: true })).toBeVisible();
    await row(page, new RegExp(customer.email.replace(/[.+]/g, "\\$&")))
      .first()
      .click();
    await expect(page).toHaveURL(new RegExp(`/customers/${customer.id}$`));
    expect(request).toBeTruthy();
  });

  test("Enter picks the highlighted result, here an order found by its number", async ({
    page,
    context,
  }) => {
    const order = (await (await context.request.get("/api/orders?pageSize=1")).json()).items[0];
    await page.keyboard.press("Control+k");
    await input(page).fill(order.number);
    await expect(row(page, new RegExp(order.number)).first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/orders/${order.id}$`));
  });

  test("says when nothing matches, and starts empty the next time", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await input(page).fill("zzzzqqqq");
    await expect(palette(page).getByText("No results found.")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+k");
    await expect(input(page)).toHaveValue("");
  });

  test("can switch the theme and open Settings > Data", async ({ page }) => {
    const dark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
    const before = await dark();
    await page.keyboard.press("Control+k");
    await input(page).fill("dark");
    await row(page, /Switch between light and dark/).click();
    await expect.poll(dark).toBe(!before);

    await page.keyboard.press("Control+k");
    await input(page).fill("reset");
    await row(page, /Reset demo data/).click();
    await expect(page).toHaveURL(/\/settings\?tab=data$/);
  });

  test("on a phone it is an icon button and the dialog fits", async ({ page, app }) => {
    await app.viewport(375, 800);
    await app.goto("/dashboard");
    await page
      .getByRole("button", { name: "Search and run commands" })
      .filter({ visible: true })
      .click();
    const box = await palette(page).boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
});

test.describe("what the palette leaves out", () => {
  test("pages and records a role may not open", async ({ page, app, signInAs }) => {
    await signInAs("support");
    await app.goto("/dashboard");
    await page.keyboard.press("Control+k");
    const names = await palette(page).getByRole("option").allInnerTexts();
    for (const hidden of [
      "Staff",
      "Analytics",
      "Billing",
      "Team members",
      "New customer",
      "Reset demo data",
    ])
      expect(
        names.some((name) => name.includes(hidden)),
        hidden
      ).toBe(false);
    for (const shown of ["Orders", "New order", "Help"])
      expect(
        names.some((name) => name.includes(shown)),
        shown
      ).toBe(true);
    await input(page).fill("analytics.test");
    await expect(palette(page).getByText("Staff", { exact: true })).toHaveCount(0);
  });
});

test.describe("keyboard shortcuts", () => {
  test.beforeEach(async ({ signInAs, app }) => {
    await signInAs("admin");
    await app.goto("/dashboard");
  });

  for (const [letter, path] of [
    ["o", "/orders"],
    ["c", "/customers"],
    ["p", "/products"],
    ["s", "/staff"],
    ["d", "/dashboard"],
  ] as const) {
    test(`g then ${letter} goes to ${path}`, async ({ page, app }) => {
      if (letter === "d") await app.goto("/orders");
      await page.keyboard.press("g");
      await page.keyboard.press(letter);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    });
  }

  test("? opens the list of shortcuts", async ({ page }) => {
    await page.keyboard.press("Shift+?");
    await expect(page).toHaveURL(/\/help\?tab=shortcuts$/);
    await expect(page.getByText("Collapse or expand the sidebar")).toBeVisible();
  });

  test("g followed by something else does nothing", async ({ page }) => {
    await page.keyboard.press("g");
    await page.keyboard.press("x");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("are ignored in a field and when a dialog is open", async ({ page, app }) => {
    await app.goto("/customers");
    await page.getByRole("searchbox").click();
    await page.keyboard.type("go");
    await expect(page).toHaveURL(/\/customers/);
    await expect(page.getByRole("searchbox")).toHaveValue("go");

    await app.goto("/account/team");
    await page.getByRole("button", { name: "Invite member" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("g");
    await page.keyboard.press("d");
    await expect(page).toHaveURL(/\/account\/team$/);
  });
});
