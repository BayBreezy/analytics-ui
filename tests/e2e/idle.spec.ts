import { expect, test } from "./fixtures";

// The fake clock makes the "minutes" pass at once.
test.describe("signing out when idle", () => {
  test("happens after the default 5 minutes without activity", async ({ page, app, signInAs }) => {
    await signInAs("admin");
    await page.clock.install();
    await app.goto("/dashboard");
    await page.clock.fastForward(4 * 60_000);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.clock.fastForward(61_000);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Signed out due to inactivity")).toBeVisible();
    await expect(page.getByText("after 5 minutes of inactivity")).toBeVisible();
  });

  test("uses the time chosen in Settings, straight away", async ({ page, app, signInAs }) => {
    await signInAs("admin");
    await page.clock.install();
    await app.goto("/settings?tab=security");
    await page.getByLabel("Sign out after").selectOption("60000");
    await expect(page.getByText("Sign-out setting updated")).toBeVisible();
    await page.clock.fastForward(61_000);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("after 1 minute of inactivity")).toBeVisible();
  });

  test("never signs out when set to never", async ({ page, app, signInAs }) => {
    await signInAs("admin");
    await page.clock.install();
    await app.goto("/settings?tab=security");
    await page.getByLabel("Sign out after").selectOption("0");
    await expect(page.getByText("Sign-out setting updated")).toBeVisible();
    await page.clock.fastForward(2 * 60 * 60_000);
    await expect(page).toHaveURL(/\/settings/);
  });

  test("activity keeps you signed in", async ({ page, app, signInAs }) => {
    await signInAs("admin");
    await page.clock.install();
    await app.goto("/dashboard");
    await page.clock.fastForward(4 * 60_000);
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.clock.fastForward(4 * 60_000);
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
