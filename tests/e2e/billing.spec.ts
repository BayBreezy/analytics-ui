import { expect, test } from "./fixtures";

test.beforeEach(async ({ signInAs, app, page }) => {
  await signInAs("admin");
  await app.goto("/account/billing");
  await expect(page.getByRole("heading", { name: /^Growth plan/ })).toBeVisible();
});

test("shows the plan, its price and renewal, and three usage meters from the store", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { name: /^Growth plan/ })).toBeVisible();
  await expect(page.getByText(/\$79 per month/)).toBeVisible();
  await expect(page.getByText(/Renews on/)).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(3);
  for (const text of ["60 / 200", "12 / 15", "120 / 500"])
    await expect(page.getByText(text)).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Team members" })).toHaveCSS(
    "--primary",
    /oklch\(76\.9%/
  );
});

test("the default card can be changed", async ({ page }) => {
  await expect(page.getByText(/ending in/)).toHaveCount(3);
  await expect(page.getByText("Default", { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: /Mastercard card ending in 4444 the default/ }).click();
  await expect(page.getByText("Default card updated")).toBeVisible();
  await expect(page.getByRole("button", { name: /Mastercard card ending in 4444/ })).toHaveCount(0);
  await expect(page.getByText("Default", { exact: true })).toHaveCount(1);
});

test("a plan the store has outgrown is refused, and the dialog stays open", async ({ page }) => {
  await page.getByRole("button", { name: "Change plan" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { level: 3 })).toHaveCount(3);
  await expect(dialog.getByRole("button", { name: "Current plan" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Switch to Starter" }).click();
  await expect(dialog.getByText(/Starter allows 50 products, and you have 60/)).toBeVisible();
  await dialog.getByRole("switch", { name: "Bill yearly" }).click();
  await expect(dialog.getByText(/Starter allows/)).toHaveCount(0);
});

test("switching to Scale yearly changes the card and adds an invoice", async ({ page }) => {
  await expect(page.locator("table tbody tr")).toHaveCount(6);
  await page.getByRole("button", { name: "Change plan" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("switch", { name: "Bill yearly" }).click();
  await expect(dialog.getByText("$790")).toBeVisible();
  await expect(dialog.getByText("$1,990")).toBeVisible();
  await dialog.getByRole("button", { name: "Switch to Scale" }).click();
  await expect(page.getByText("You're on the Scale plan")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText(/\$1,990 per year/)).toBeVisible();
  await expect(page.getByText("60 / 1,000")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toContainText("Scale plan, yearly");
});

test("cancelling asks first, shows the end date and can be undone", async ({ page }) => {
  await page.getByRole("button", { name: "Cancel plan" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("button", { name: "Cancel plan" })).toBeVisible();

  await page.getByRole("button", { name: "Cancel plan" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel plan" }).click();
  await expect(page.getByText("Plan set to cancel")).toBeVisible();
  await expect(page.getByText("Cancels soon")).toBeVisible();
  await expect(page.getByText(/Your plan won't renew/)).toBeVisible();
  await page.getByRole("button", { name: "Keep my plan" }).click();
  await expect(page.getByText("Your plan will renew")).toBeVisible();
  await expect(page.getByText("Cancels soon")).toHaveCount(0);
});

test("invoices open as a printable page and download", async ({ page }) => {
  const view = page.getByRole("link", { name: /View invoice/ }).first();
  await expect(view).toHaveAttribute("href", /^\/api\/billing\/invoices\/bill_/);
  const [popup] = await Promise.all([page.waitForEvent("popup"), view.click()]);
  await popup.waitForLoadState();
  await expect(popup).toHaveTitle(/^INV-/);
  await expect(popup.getByText("demo invoice")).toBeVisible();
  await popup.close();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("link", { name: /Download invoice/ })
      .first()
      .click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^INV-.*\.html$/);
});

test("the plans dialog fits a phone", async ({ page, app }) => {
  await app.viewport(375, 800);
  await page.getByRole("button", { name: "Change plan" }).click();
  const box = await page.getByRole("dialog").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
});
