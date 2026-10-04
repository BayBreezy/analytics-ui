import { expect, test } from "../e2e/fixtures";

// Takes the pictures for the README into docs/screenshots. It isn't part of `bun run test`: run it
// with `bun run screenshots`.
const OUT = "docs/screenshots";

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

/** The page is done loading and the charts have finished drawing. */
async function settle(page: import("@playwright/test").Page) {
  await expect(page.locator("[data-slot='skeleton']")).toHaveCount(0, { timeout: 15_000 });
  await page.waitForTimeout(1500);
}

const shot = (page: import("@playwright/test").Page, name: string) =>
  page.screenshot({
    path: `${OUT}/${name}.jpg`,
    type: "jpeg",
    quality: 82,
    animations: "disabled",
  });

test.beforeEach(async ({ signInAs }) => signInAs("admin"));

test("dashboard", async ({ page, app }) => {
  await app.goto("/dashboard");
  await settle(page);
  await shot(page, "dashboard");
});

test("dashboard in dark mode", async ({ page, app }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await app.goto("/dashboard");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("dark")))
    .toBe(true);
  await settle(page);
  await shot(page, "dashboard-dark");
});

test("customers with rows selected", async ({ page, app }) => {
  await app.goto("/customers");
  await expect(page.locator("table tbody tr").first()).toBeVisible();
  await page.locator("table tbody tr").nth(1).getByRole("checkbox").click();
  await page.locator("table tbody tr").nth(2).getByRole("checkbox").click();
  await settle(page);
  await shot(page, "customers");
});

test("statistics", async ({ page, app }) => {
  await app.goto("/analytics/statistics");
  await settle(page);
  await shot(page, "statistics");
});

test("command palette", async ({ page, app }) => {
  await app.goto("/orders");
  await expect(page.locator("table tbody tr").first()).toBeVisible();
  await page.keyboard.press("Control+k");
  await page.getByPlaceholder("Search pages, records and actions").fill("an");
  await expect(page.getByRole("dialog").getByRole("option").first()).toBeVisible();
  await page.waitForTimeout(800);
  await shot(page, "command-palette");
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

  test("dashboard", async ({ page, app }) => {
    await app.goto("/dashboard");
    await settle(page);
    await shot(page, "dashboard-mobile");
  });
});
