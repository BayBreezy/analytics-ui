import { expect, test } from "./fixtures";

test.beforeEach(async ({ signInAs, app }) => {
  await signInAs("admin");
  await app.goto("/settings");
});

test("has five tabs that live in the URL", async ({ page }) => {
  await expect(page.getByRole("tab")).toHaveText([
    "General",
    "Appearance",
    "Notifications",
    "Security",
    "Data",
  ]);
  await page.getByRole("tab", { name: "Notifications" }).click();
  await expect(page).toHaveURL(/tab=notifications/);
  await expect(page.getByText("Weekly report")).toBeVisible();
});

test.describe("general", () => {
  test("checks the fields, then saves them for the sidebar and the tab title", async ({
    page,
    app,
  }) => {
    const save = page.getByRole("button", { name: "Save changes" });
    await expect(save).toBeDisabled();
    await expect(page.getByLabel("Store name")).toHaveValue("Analytics");
    await page.getByLabel("Store name").fill("A");
    await save.click();
    await expect(page.getByText("Store name must be at least 2 characters")).toBeVisible();
    await page.getByLabel("Store name").fill("Acme Goods");
    await page.getByLabel("Support email").fill("nope");
    await save.click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await page.getByLabel("Support email").fill("help@acme.test");
    await page.getByLabel("Timezone").selectOption("Europe/Paris");
    await save.click();
    await expect(page.getByText("Settings saved")).toBeVisible();
    await expect(page.locator("[data-slot='sidebar']").first()).toContainText("Acme Goods");
    await expect(page).toHaveTitle("Settings · Acme Goods");
    await expect(save).toBeDisabled();

    await app.goto("/customers");
    await expect(page).toHaveTitle("Customers · Acme Goods");
    await app.goto("/settings");
    await expect(page.getByLabel("Store name")).toHaveValue("Acme Goods");
    await expect(page.getByLabel("Timezone")).toHaveValue("Europe/Paris");
  });
});

test.describe("appearance", () => {
  test("the theme applies at once and the default page size reaches the lists", async ({
    page,
    app,
  }) => {
    await app.goto("/settings?tab=appearance");
    const isDark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
    await page.getByRole("radio", { name: "Dark" }).click();
    await expect.poll(isDark).toBe(true);
    await page.getByRole("radio", { name: "Light" }).click();
    await expect.poll(isDark).toBe(false);

    await page.getByLabel("Default page size").selectOption("25");
    await expect(page.getByText("Default page size updated")).toBeVisible();
    await app.goto("/customers");
    await expect(page.locator("table tbody tr")).toHaveCount(25);
    await expect(page).not.toHaveURL(/pageSize/);
    await app.goto("/customers?pageSize=10");
    await expect(page.locator("table tbody tr")).toHaveCount(10);
    await app.goto("/settings?tab=appearance");
    await expect(page.getByLabel("Default page size")).toHaveValue("25");
  });
});

test.describe("notifications", () => {
  test("toggles are saved only when asked, and reset puts them back", async ({ page, context }) => {
    await page.getByRole("tab", { name: "Notifications" }).click();
    await expect(page.getByRole("switch")).toHaveCount(10);
    const orderEmail = page.getByRole("switch", { name: "New order by email" });
    const save = page.getByRole("button", { name: "Save changes" });
    await expect(orderEmail).toBeChecked();
    await expect(save).toBeDisabled();
    await orderEmail.click();
    await expect(save).toBeEnabled();
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(orderEmail).toBeChecked();

    await orderEmail.click();
    await page.getByRole("switch", { name: "Low stock in the app" }).click();
    await save.click();
    await expect(page.getByText("Notification settings saved")).toBeVisible();
    const saved = await (await context.request.get("/api/settings")).json();
    expect(saved.notifications.newOrder.email).toBe(false);
    expect(saved.notifications.lowStock.inApp).toBe(false);
  });
});

test.describe("security", () => {
  test("starts at 5 minutes", async ({ page }) => {
    await page.getByRole("tab", { name: "Security" }).click();
    await expect(page.getByLabel("Sign out after")).toHaveValue(String(5 * 60_000));
  });
});

test.describe("data", () => {
  test("reset demo data asks first, then restores the sample data and the store name", async ({
    page,
    context,
  }) => {
    await page.getByLabel("Store name").fill("Changed");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.locator("[data-slot='sidebar']").first()).toContainText("Changed");
    await context.request.post("/api/staff", {
      data: {
        name: "Temp Person",
        email: "temp@x.test",
        phone: "555-123-4567",
        role: "support",
        status: "active",
      },
    });

    await page.getByRole("tab", { name: "Data" }).click();
    await page.getByRole("button", { name: "Reset demo data" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }).click();
    expect((await (await context.request.get("/api/staff")).json()).total).toBe(13);

    await page.getByRole("button", { name: "Reset demo data" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Reset data" }).click();
    await expect(page.getByText("Demo data reset", { exact: true })).toBeVisible();
    await expect(page.locator("[data-slot='sidebar']").first()).not.toContainText("Changed");
    expect((await (await context.request.get("/api/staff")).json()).total).toBe(12);
  });
});
