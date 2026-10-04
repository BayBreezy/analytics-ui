import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ signInAs }) => signInAs("admin"));

const rows = (page: Page) => page.locator("table tbody tr");
const selectionBar = (page: Page) => page.getByRole("status").filter({ hasText: "selected" });
const csvLines = (path: string) => readFileSync(path, "utf8").replace(/^﻿/, "").trim().split("\r\n");

async function download(page: Page, name: RegExp) {
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name }).click(),
  ]);
  return { filename: file.suggestedFilename(), lines: csvLines((await file.path())!) };
}

test.describe("export", () => {
  test("the button names the total and downloads every customer, not just the page", async ({
    page,
    app,
  }) => {
    await app.goto("/customers");
    const link = page.getByRole("link", { name: "Export 48 customers as CSV" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /^\/api\/customers\/export\?/);
    const { filename, lines } = await download(page, /^Export 48 customers/);
    expect(filename).toMatch(/^customers-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(lines).toHaveLength(49);
    expect(lines[0]).toMatch(/^ID,Name,Email/);
  });

  test("follows the filter, the sort and the search on screen", async ({ page, app }) => {
    await app.goto("/customers?status=inactive");
    const inactive = Number((await page.getByText(/\d+ in total/).innerText()).match(/\d+/)![0]);
    const filtered = await download(page, new RegExp(`^Export ${inactive} customers`));
    expect(filtered.lines).toHaveLength(inactive + 1);
    for (const line of filtered.lines.slice(1)) expect(line).toContain(",inactive,");

    await app.goto("/products?sort=price&order=desc&pageSize=10");
    await expect(rows(page).first()).toBeVisible();
    const products = await download(page, /^Export 60 products/);
    const prices = products.lines.slice(1).map((line) => Number(line.split(",").at(-4)));
    expect(prices).toHaveLength(60);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test("is left out when nothing matches", async ({ page, app }) => {
    await app.goto("/customers?search=zzzzqqqq");
    await expect(page.getByText("No matches")).toBeVisible();
    await expect(page.getByRole("link", { name: /^Export/ })).toHaveCount(0);
  });

  test("is on orders and staff as well", async ({ page, app }) => {
    await app.goto("/orders");
    await expect(page.getByRole("link", { name: "Export 120 orders as CSV" })).toBeVisible();
    await app.goto("/staff");
    await expect(page.getByRole("link", { name: "Export 12 staff as CSV" })).toBeVisible();
  });
});

test.describe("bulk actions", () => {
  test("ticking rows shows a bar with the count, and the header box selects the page", async ({
    page,
    app,
  }) => {
    await app.goto("/customers");
    await expect(rows(page)).toHaveCount(10);
    const all = page.getByRole("checkbox", { name: "Select all on this page" });
    await expect(page.getByRole("checkbox", { name: /^Select / })).toHaveCount(11);
    await expect(selectionBar(page)).toHaveCount(0);

    await rows(page).nth(0).getByRole("checkbox").click();
    await expect(selectionBar(page)).toContainText("1 selected on this page");
    await expect(page).toHaveURL(/\/customers$/);
    await expect(all).toHaveAttribute("aria-checked", "mixed");

    await all.click();
    await expect(selectionBar(page)).toContainText("10 selected");
    await all.click();
    await expect(selectionBar(page)).toHaveCount(0);

    await rows(page).nth(0).getByRole("checkbox").click();
    await selectionBar(page).getByRole("button", { name: "Clear" }).click();
    await expect(selectionBar(page)).toHaveCount(0);
  });

  test("set status changes the rows and clears the selection", async ({ page, app }) => {
    await app.goto("/customers");
    await rows(page).nth(0).getByRole("checkbox").click();
    await rows(page).nth(1).getByRole("checkbox").click();
    await selectionBar(page).getByRole("button", { name: "Set status" }).click();
    await page.getByRole("menuitem", { name: "inactive" }).click();
    await expect(page.getByText("Updated 2 customers")).toBeVisible();
    await expect(rows(page).nth(0)).toContainText(/inactive/i);
    await expect(rows(page).nth(1)).toContainText(/inactive/i);
    await expect(selectionBar(page)).toHaveCount(0);
  });

  test("delete asks first, can be cancelled, and removes the rows", async ({ page, app }) => {
    await app.goto("/customers");
    for (const index of [2, 3, 4]) await rows(page).nth(index).getByRole("checkbox").click();
    await selectionBar(page).getByRole("button", { name: "Delete" }).click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toContainText("Delete 3 customers?");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(selectionBar(page)).toContainText("3 selected");
    await expect(page.getByText("48 in total")).toBeVisible();

    await selectionBar(page).getByRole("button", { name: "Delete" }).click();
    await dialog.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText("Deleted 3 customers")).toBeVisible();
    await expect(page.getByText("45 in total")).toBeVisible();
    await expect(selectionBar(page)).toHaveCount(0);
  });

  test("the selection starts again on another page or a new search", async ({ page, app }) => {
    await app.goto("/customers");
    await rows(page).nth(0).getByRole("checkbox").click();
    await app.goto("/customers?page=2");
    await expect(rows(page).first()).toBeVisible();
    await expect(selectionBar(page)).toHaveCount(0);
    await rows(page).nth(0).getByRole("checkbox").click();
    await page.getByRole("searchbox").fill("a");
    await expect(selectionBar(page)).toHaveCount(0);
  });

  test("deleting a whole last page steps back to the one before", async ({ page, app }) => {
    await app.goto("/customers?pageSize=25&page=2");
    await expect(rows(page).first()).toBeVisible();
    const onPage = await rows(page).count();
    await page.getByRole("checkbox", { name: "Select all on this page" }).click();
    await selectionBar(page).getByRole("button", { name: "Delete" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete", exact: true })
      .click();
    await expect(page.getByText(new RegExp(`Deleted ${onPage} customers`))).toBeVisible();
    await expect(page).not.toHaveURL(/page=2/);
    await expect(rows(page).first()).toBeVisible();
  });

  test("a failure is explained and the rest still go through (the last admin)", async ({
    page,
    app,
  }) => {
    await app.goto("/staff");
    await expect(rows(page).first()).toBeVisible();
    const admins = rows(page).filter({ hasText: /admin/i });
    const count = await admins.count();
    expect(count).toBe(2);
    for (let i = 0; i < count; i++) await admins.nth(i).getByRole("checkbox").click();
    await selectionBar(page).getByRole("button", { name: "Delete" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete", exact: true })
      .click();
    await expect(page.getByText("Deleted 1 of 2")).toBeVisible();
    await expect(page.getByText(/At least one active admin is required/).first()).toBeVisible();
  });

  test("only roles that can change records see the checkboxes", async ({ page, app, signInAs }) => {
    await signInAs("support");
    await app.goto("/customers");
    await expect(rows(page).first()).toBeVisible();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await app.goto("/orders");
    await expect(page.getByRole("checkbox", { name: "Select all on this page" })).toBeVisible();
  });

  test("fits a phone with the bar open", async ({ page, app }) => {
    await app.viewport(375, 800);
    await app.goto("/customers");
    await rows(page).nth(0).getByRole("checkbox").click();
    await rows(page).nth(1).getByRole("checkbox").click();
    await expect(selectionBar(page)).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
});
