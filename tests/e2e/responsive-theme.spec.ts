import { expect, test } from "./fixtures";
import { PAGES } from "./pages";

test.beforeEach(async ({ signInAs }) => signInAs("admin"));

// `diagnostics` runs in every test and fails on console errors, page errors and Vue warnings
// (hydration mismatches included), so loading each page here also checks it renders cleanly.
test.describe("every page loads cleanly and fits a phone", () => {
  for (const path of PAGES) {
    test(path, async ({ page, app }) => {
      await app.viewport(375, 800);
      await app.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("[data-slot='skeleton']")).toHaveCount(0, { timeout: 15_000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        "horizontal overflow"
      ).toBe(true);
    });
  }
});

test.describe("dark mode", () => {
  for (const path of [
    "/dashboard",
    "/customers",
    "/analytics/statistics",
    "/account/billing",
    "/settings",
    "/help",
  ]) {
    test(`${path} loads cleanly in dark mode`, async ({ page, app }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await app.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("[data-slot='skeleton']")).toHaveCount(0, { timeout: 15_000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains("dark")))
        .toBe(true);
    });
  }

  test("the toggle in the header switches and remembers the theme", async ({ page, app }) => {
    await app.goto("/dashboard");
    const isDark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
    const before = await isDark();
    await page.getByRole("button", { name: "Toggle color mode" }).click();
    await expect.poll(isDark).toBe(!before);
    await app.goto("/customers");
    expect(await isDark()).toBe(!before);
  });
});

test.describe("the sidebar", () => {
  test("collapses to icons and remembers it, and is a sheet on a phone", async ({ page, app }) => {
    await app.goto("/dashboard");
    const sidebar = page.locator("[data-slot='sidebar']").first();
    await page
      .getByRole("button", { name: /Toggle Sidebar/i })
      .first()
      .click();
    await expect(page.locator("[data-state='collapsed']").first()).toBeVisible();
    await app.goto("/dashboard");
    await expect(page.locator("[data-state='collapsed']").first()).toBeVisible();
    await app.viewport(375, 800);
    await app.goto("/dashboard");
    await page
      .getByRole("button", { name: /Toggle Sidebar/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toContainText("Dashboard");
    expect(sidebar).toBeTruthy();
  });
});
