import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ signInAs, app }) => {
  await signInAs("admin");
  await app.goto("/dashboard");
});

// While its menu is open the rest of the page is hidden from assistive technology, so the bell is
// found with `includeHidden`.
const bell = (page: Page) =>
  page.getByRole("button", { name: /^Notifications/, includeHidden: true });

const goTo = (page: Page, path: string) =>
  page.evaluate(
    (to) =>
      (window as unknown as { useNuxtApp: () => { $router: { push: (to: string) => void } } })
        .useNuxtApp()
        .$router.push(to),
    path
  );

test.describe("notification bell", () => {
  test("shows the unread count and the notifications, newest first", async ({ page }) => {
    await expect(bell(page)).toHaveAccessibleName("Notifications, 3 unread");
    await expect(bell(page)).toHaveText("3");
    await bell(page).click();
    const items = page.getByRole("menuitem");
    await expect(items).toHaveCount(5);
    await expect(items.first()).toContainText("New order #ORD-4821");
    await expect(items.first()).toContainText(/hour ago|hours ago|minute/);
    await expect(page.getByRole("img", { name: "Unread" })).toHaveCount(3);
  });

  test("opening one follows its link and marks it read", async ({ page }) => {
    await bell(page).click();
    await page.getByRole("menuitem").first().click();
    await expect(page).toHaveURL(/\/orders\/ord_4821$/);
    await expect(bell(page)).toHaveAccessibleName("Notifications, 2 unread");
  });

  test("mark all as read clears the badge", async ({ page }) => {
    await bell(page).click();
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(page.getByRole("img", { name: "Unread" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Mark all as read" })).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(bell(page)).toHaveAccessibleName("Notifications");
  });

  test("a new order shows up after moving to another page, unless it is switched off in Settings", async ({
    page,
    context,
  }) => {
    const customer = (await (await context.request.get("/api/customers?pageSize=1")).json())
      .items[0].id;
    const product = (await (await context.request.get("/api/products?pageSize=1")).json()).items[0]
      .id;
    const order = () =>
      context.request.post("/api/orders", {
        data: {
          customerId: customer,
          status: "pending",
          notes: "",
          items: [{ productId: product, quantity: 1 }],
        },
      });

    await bell(page).click();
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await page.keyboard.press("Escape");
    await order();
    await goTo(page, "/orders");
    await expect(bell(page)).toHaveAccessibleName("Notifications, 1 unread");
    await bell(page).click();
    await expect(page.getByRole("menuitem").first()).toContainText("New order #ORD-4822");
    await page.keyboard.press("Escape");

    const settings = await (await context.request.get("/api/settings")).json();
    settings.notifications.newOrder.inApp = false;
    await context.request.put("/api/settings", { data: settings });
    await order();
    await goTo(page, "/dashboard");
    await expect(bell(page)).toHaveAccessibleName("Notifications, 1 unread");
  });

  test("team news is only shown to admins", async ({ page, app, signInAs }) => {
    await bell(page).click();
    await expect(page.getByRole("menuitem")).toHaveCount(5);
    await signInAs("manager");
    await app.goto("/dashboard");
    await bell(page).click();
    await expect(page.getByRole("menuitem")).toHaveCount(4);
    await expect(page.getByText("joined the team")).toHaveCount(0);
  });

  test("the menu fits a phone", async ({ page, app }) => {
    await app.viewport(375, 800);
    await app.goto("/dashboard");
    await bell(page).click();
    const box = await page.getByRole("menu").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
});

test.describe("reminders", () => {
  const card = (page: Page) =>
    page.locator("[data-slot='card']").filter({ hasText: "Reminders" }).first();

  test("ticking one off updates the count and is saved", async ({ page, app }) => {
    await expect(card(page).getByText("4 left for today")).toBeVisible();
    const box = card(page).getByRole("checkbox", { name: /Restock low inventory/ });
    await box.click();
    await expect(card(page).getByText("3 left for today")).toBeVisible();
    await app.goto("/dashboard");
    await expect(
      card(page).getByRole("checkbox", { name: /Restock low inventory/ })
    ).toHaveAttribute("aria-checked", "true");
    await expect(card(page).getByText("3 left for today")).toBeVisible();
    await card(page)
      .getByRole("checkbox", { name: /Restock low inventory/ })
      .click();
    await expect(card(page).getByText("4 left for today")).toBeVisible();
  });

  test("a new one is checked, added with Enter or the button, and saved", async ({ page, app }) => {
    const input = card(page).getByLabel("New reminder");
    await card(page).getByRole("button", { name: "Add", exact: true }).click();
    await expect(card(page).getByText(/at least 2 characters/)).toBeVisible();
    await input.fill("x");
    await expect(card(page).getByText(/at least 2 characters/)).toHaveCount(0);
    await input.fill("Order more shipping boxes");
    await input.press("Enter");
    await expect(card(page).getByText("Order more shipping boxes")).toBeVisible();
    await expect(input).toHaveValue("");
    await expect(card(page).getByText("5 left for today")).toBeVisible();
    await app.goto("/dashboard");
    await expect(card(page).getByText("Order more shipping boxes")).toBeVisible();
  });

  test("deleting works, and with none left there is a hint", async ({ page }) => {
    await card(page)
      .getByRole("button", { name: "Delete reminder: Restock low inventory items" })
      .click();
    await expect(card(page).getByText("Restock low inventory items")).toHaveCount(0);
    while (
      (await card(page)
        .getByRole("button", { name: /Delete reminder/ })
        .count()) > 0
    )
      await card(page)
        .getByRole("button", { name: /Delete reminder/ })
        .first()
        .click();
    await expect(card(page).getByText("Nothing to do. Add a reminder below.")).toBeVisible();
    await expect(card(page).getByText("0 left for today")).toBeVisible();
  });

  // Aborting the request is how the failure is made, and the browser logs it.
  test.describe("when saving fails", () => {
    test.use({ allowedConsole: /ERR_FAILED/ });

    test("the tick is put back and the user is told", async ({ page }) => {
      await page.route("**/api/dashboard/reminders/*", (route) => route.abort());
      const box = card(page).getByRole("checkbox", { name: /Restock low inventory/ });
      await box.click();
      await expect(page.getByText("Couldn't update the reminder")).toBeVisible();
      await expect(box).toHaveAttribute("aria-checked", "false");
      await expect(card(page).getByText("4 left for today")).toBeVisible();
    });
  });
});
