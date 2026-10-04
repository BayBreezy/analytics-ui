import { expect, test } from "./fixtures";

test.beforeEach(async ({ signInAs, app }) => {
  await signInAs("admin");
  await app.goto("/help");
});

test("has four tabs in the URL", async ({ page }) => {
  await expect(page.getByRole("tab")).toHaveText([
    "FAQ",
    "Contact support",
    "Shortcuts",
    "What's new",
  ]);
  await expect(page).toHaveTitle("Help · Analytics");
});

test.describe("FAQ", () => {
  test("is grouped by topic and answers open on click", async ({ page }) => {
    await expect(page.locator("[data-slot='card-title']")).toHaveCount(5);
    await expect(page.getByText("Pick a customer, add one or more products")).toBeHidden();
    await page.getByRole("button", { name: "How do I create an order?" }).click();
    await expect(page.getByText("Pick a customer, add one or more products")).toBeVisible();
  });

  test("search narrows the topics and opens the answers, with a way out when nothing matches", async ({
    page,
  }) => {
    await page.getByLabel("Search the FAQ").fill("invite");
    await expect(page.locator("[data-slot='card-title']")).toHaveCount(1);
    await expect(page.getByText("How do I invite someone to my team?")).toBeVisible();
    await expect(page.getByText(/Invitations last 7 days/)).toBeVisible();
    await page.getByLabel("Search the FAQ").fill("zzzzqqq");
    await expect(page.getByText("No answers found")).toBeVisible();
    await page.getByRole("button", { name: "Contact support" }).click();
    await expect(page).toHaveURL(/tab=contact/);
  });
});

test.describe("contact support", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("tab", { name: "Contact support" }).click();
    await expect(page.getByText("Order #ORD-4790 shows the wrong total")).toBeVisible();
  });

  test("lists the requests with their replies and a close button where it applies", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: "Close request" })).toHaveCount(2);
    await expect(page.getByText(/Make them an admin from Team members/)).toBeVisible();
  });

  test("validates, sends, lists the new request and can close it", async ({ page }) => {
    const send = page.getByRole("button", { name: "Send message" });
    await send.click();
    await expect(page.getByText(/subject/i).first()).toBeVisible();
    await page.getByLabel("Subject").fill("Broken chart on analytics");
    await page.getByLabel("Category").selectOption("bug");
    await page.getByLabel("Priority").selectOption("high");
    await page.getByLabel("Message").fill("short");
    await send.click();
    await expect(page.getByText("Add a few more details (at least 10 characters)")).toBeVisible();
    await page.getByLabel("Message").fill("The trends chart is empty after I change the range.");
    await send.click();
    await expect(page.getByText("Message sent")).toBeVisible();
    await expect(page.getByLabel("Subject")).toHaveValue("");
    const request = page.locator("li").filter({ hasText: "Broken chart on analytics" });
    await expect(request.getByText("open", { exact: true })).toBeVisible();
    await request.getByRole("button", { name: "Close request" }).click();
    await expect(page.getByText("Request closed")).toBeVisible();
    await expect(request.getByText("closed", { exact: true })).toBeVisible();
    await expect(request.getByRole("button", { name: "Close request" })).toHaveCount(0);
  });
});

test.describe("shortcuts and what's new", () => {
  test("lists the shortcuts that exist", async ({ page }) => {
    await page.getByRole("tab", { name: "Shortcuts" }).click();
    await expect(page.getByText("Collapse or expand the sidebar")).toBeVisible();
    await expect(page.getByText("Search and run commands (or press /)")).toBeVisible();
    expect(await page.locator("kbd").count()).toBeGreaterThanOrEqual(10);
  });

  test("shows the changelog, newest first", async ({ page }) => {
    await page.getByRole("tab", { name: "What's new" }).click();
    await expect(page.locator("ol > li")).toHaveCount(5);
    await expect(page.getByText("Latest")).toBeVisible();
    await expect(page.locator("ol > li").first()).toContainText(
      "Account, settings, billing and help"
    );
  });
});
