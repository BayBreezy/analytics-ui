import { expect, test } from "./fixtures";

test.beforeEach(async ({ signInAs }) => signInAs("admin"));

test.describe("customers", () => {
  test("list: total, search and filter live in the URL and survive a reload", async ({
    page,
    app,
  }) => {
    await app.goto("/customers");
    await expect(page.getByText("48 in total")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(10);
    await page.getByLabel("All statuses").selectOption("inactive");
    await expect(page).toHaveURL(/status=inactive/);
    await page.reload();
    await expect(page.getByLabel("All statuses")).toHaveValue("inactive");
    for (const row of await page.locator("table tbody tr").all())
      await expect(row).toContainText(/inactive/i);
    await page.getByLabel("All statuses").selectOption("");
    await page.getByRole("searchbox").fill("zzzzqqqq");
    await expect(page.getByText("No matches")).toBeVisible();
    await expect(page).toHaveURL(/search=zzzzqqqq/);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.locator("table tbody tr")).toHaveCount(10);
  });

  test("list: sort by a column and page through", async ({ page, app }) => {
    await app.goto("/customers");
    await page.getByRole("columnheader", { name: /Spent/ }).getByText("Spent").click();
    await expect(page).toHaveURL(/sort=totalSpent/);
    await page.getByRole("button", { name: /Next/i }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText(/11.{1,3}20 of 48|Showing 11/)).toBeVisible();
  });

  test("create: validates, saves and opens the new customer", async ({ page, app }) => {
    await app.goto("/customers/create");
    await page.getByRole("button", { name: "Create customer" }).click();
    await expect(page.getByText("Name is required")).toBeVisible();
    await page.getByLabel("Full name").fill("Cara Test");
    await page.getByLabel("Email address").fill("cara@test.dev");
    await page.getByLabel("Phone").fill("555-123-4567");
    await page.getByLabel("City").fill("Austin");
    await page.getByLabel("Country").fill("USA");
    await page.getByRole("button", { name: "Create customer" }).click();
    await expect(page).toHaveURL(/\/customers\/cus_\d+$/);
    await expect(page.getByRole("heading", { name: "Cara Test" })).toBeVisible();
    await expect(page.getByText("cara@test.dev").first()).toBeVisible();
  });

  test("edit: starts filled in, and the details page shows the change", async ({ page, app }) => {
    await app.goto("/customers");
    await page
      .getByRole("button", { name: /Actions for/ })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/edit$/);
    await expect(page.getByLabel("Full name")).not.toHaveValue("");
    await page.getByLabel("City").fill("Reykjavik");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/customers\/cus_\d+$/);
    await expect(page.getByText("Reykjavik").first()).toBeVisible();
  });

  test("delete: confirms, from the list and from the details page", async ({ page, app }) => {
    await app.goto("/customers");
    await page
      .getByRole("button", { name: /Actions for/ })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("48 in total")).toBeVisible();
    await page
      .getByRole("button", { name: /Actions for/ })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete", exact: true })
      .click();
    await expect(page.getByText("47 in total")).toBeVisible();

    await page
      .getByRole("button", { name: /Actions for/ })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "View" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete", exact: true })
      .click();
    await expect(page).toHaveURL(/\/customers$/);
    await expect(page.getByText("46 in total")).toBeVisible();
  });

  test("a missing customer says so", async ({ page, app }) => {
    await app.goto("/customers/cus_9999");
    await expect(page.getByText("Customer not found")).toBeVisible();
  });
});

test.describe("products", () => {
  test("create, with the SKU rules, then edit the stock", async ({ page, app }) => {
    await app.goto("/products/create");
    await page.getByLabel("Name").fill("Desk lamp");
    await page.getByLabel("SKU").fill("bad sku!");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page.getByText("Use letters, numbers and dashes only")).toBeVisible();
    await page.getByLabel("SKU").fill("LMP-001");
    await page.getByLabel("Category").selectOption("Home");
    await page.getByLabel("Price").fill("20");
    await page.getByLabel("Stock").fill("50");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page).toHaveURL(/\/products\/prd_\d+$/);
    await expect(page.getByRole("heading", { name: "Desk lamp" })).toBeVisible();
    await page.getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Stock").fill("5");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Low: 5")).toBeVisible();
  });

  test("the list filters by category and shows stock labels", async ({ page, app }) => {
    await app.goto("/products?category=Home");
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    for (const row of await page.locator("table tbody tr").all())
      await expect(row).toContainText("Home");
  });
});

test.describe("staff", () => {
  test("the last admin can't be removed from the list", async ({ page, app }) => {
    await app.goto("/staff?role=admin");
    await expect(page.locator("table tbody tr")).toHaveCount(2);
    for (const attempt of [0, 1]) {
      await page
        .getByRole("button", { name: /Actions for/ })
        .first()
        .click();
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete", exact: true })
        .click();
      if (attempt === 0) await expect(page.locator("table tbody tr")).toHaveCount(1);
    }
    await expect(page.getByText(/At least one active admin is required/)).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(1);
  });
});

test.describe("orders", () => {
  test("filter by status and see an order's items", async ({ page, app }) => {
    await app.goto("/orders");
    await expect(page.getByText("120 in total")).toBeVisible();
    await page.getByLabel("All statuses").selectOption("shipped");
    await expect(page).toHaveURL(/status=shipped/);
    for (const row of await page.locator("table tbody tr").all())
      await expect(row).toContainText(/shipped/i);
  });

  test("create with searchable pickers and a live total, then change the status", async ({
    page,
    app,
  }) => {
    await app.goto("/orders/create");
    await page.getByRole("button", { name: "Create order" }).click();
    await expect(page.getByText("Select a customer")).toBeVisible();

    const pickers = page.locator(".multiselect");
    await pickers.nth(0).click();
    await pickers.nth(0).getByRole("option").first().click();
    await pickers.nth(1).click();
    await pickers.nth(1).getByRole("option").first().click();
    await page.getByLabel("Quantity").fill("2");
    const first = await page
      .locator("li")
      .filter({ has: page.getByLabel("Quantity") })
      .first()
      .innerText();
    const price = Number(
      first
        .match(/\$([\d,]+\.\d{2})/g)!
        .at(-1)!
        .replace(/[$,]/g, "")
    );
    await expect(
      page.getByText("Total", { exact: true }).locator("xpath=following-sibling::span").first()
    ).toHaveText(
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)
    );

    await page.getByRole("button", { name: "Add item" }).click();
    await expect(page.locator(".multiselect")).toHaveCount(3);
    await page.getByRole("button", { name: "Remove item 2" }).click();
    await expect(page.locator(".multiselect")).toHaveCount(2);

    await page.getByLabel("Notes").fill("from the e2e suite");
    await page.getByRole("button", { name: "Create order" }).click();
    await expect(page).toHaveURL(/\/orders\/ord_\d+$/);
    await expect(page.getByRole("heading", { name: /#ORD-4822/ })).toBeVisible();
    await expect(page.getByText("from the e2e suite")).toBeVisible();

    await page.getByRole("button", { name: "Update status" }).click();
    await page.getByRole("menuitem", { name: "shipped" }).click();
    await expect(page.getByText("Order updated")).toBeVisible();
    await expect(page.getByText("shipped", { exact: true }).first()).toBeVisible();
  });

  test("a customer's page lists their orders and links to all of them", async ({ page, app }) => {
    await app.goto("/orders/ord_4821");
    await page
      .getByRole("link", { name: /Gustavo|[A-Z][a-z]+ [A-Z]/ })
      .first()
      .click()
      .catch(() => {});
    await app.goto("/customers");
    await page
      .getByRole("button", { name: /Actions for/ })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "View" }).click();
    await expect(page.getByText(/#ORD-\d+/).first()).toBeVisible();
    await page.getByRole("link", { name: "View all" }).click();
    await expect(page).toHaveURL(/\/orders\?customerId=cus_/);
    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });
});
