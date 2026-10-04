import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ signInAs, app }) => {
  await signInAs("admin");
  await app.goto("/account/team");
});

const listRows = (page: Page) => page.locator("ul.divide-y > li");
const row = (page: Page, text: string) => listRows(page).filter({ hasText: text });
const dialog = (page: Page) => page.getByRole("dialog");

test("shows the team with counts, search and a role filter", async ({ page }) => {
  await expect(listRows(page)).toHaveCount(12);
  await expect(page.getByRole("tab", { name: /Members/ })).toContainText("12");
  await expect(page.getByRole("tab", { name: /Invitations/ })).toContainText("3");
  await page.getByLabel("Search team members").fill("zzzz");
  await expect(page.getByText("No team members found")).toBeVisible();
  await page.getByLabel("Search team members").fill("");
  await page.getByLabel("Filter by role").selectOption("admin");
  await expect(listRows(page)).toHaveCount(2);
});

test.describe("inviting", () => {
  test("checks the form, sends the invitation and lands on the Invitations tab", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Invite member" }).click();
    await page.getByRole("button", { name: "Send invitation" }).click();
    await expect(dialog(page).locator("p.text-destructive").first()).toBeVisible();
    await dialog(page).getByLabel("Email address").fill("e2e.invite@example.com");
    await dialog(page).getByLabel("Role").selectOption("manager");
    await dialog(page).getByLabel("Message (optional)").fill("Welcome aboard");
    await page.getByRole("button", { name: "Send invitation" }).click();
    await expect(page.getByText("Invitation sent")).toBeVisible();
    await expect(page).toHaveURL(/tab=invitations/);
    await expect(listRows(page).first()).toContainText("e2e.invite@example.com");
    await expect(page.getByRole("tab", { name: /Invitations/ })).toContainText("4");
  });

  test("shows the server's reason for a duplicate, and starts empty next time", async ({
    page,
  }) => {
    for (const attempt of [1, 2]) {
      await page.getByRole("button", { name: "Invite member" }).click();
      await expect(dialog(page).getByLabel("Email address")).toHaveValue("");
      await dialog(page).getByLabel("Email address").fill("twice@example.com");
      await dialog(page).getByLabel("Role").selectOption("support");
      await page.getByRole("button", { name: "Send invitation" }).click();
      if (attempt === 1) await expect(page.getByText("Invitation sent")).toBeVisible();
      else await expect(dialog(page).getByText(/already a pending invitation/)).toBeVisible();
    }
  });
});

test.describe("invitations", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("button", { name: "Invite member" }).click();
    await dialog(page).getByLabel("Email address").fill("e2e.invite@example.com");
    await dialog(page).getByLabel("Role").selectOption("manager");
    await page.getByRole("button", { name: "Send invitation" }).click();
    await expect(row(page, "e2e.invite@example.com")).toBeVisible();
  });

  const menu = async (page: Page, item: string | RegExp) => {
    await row(page, "e2e.invite@example.com")
      .getByRole("button", { name: /Actions for/ })
      .click();
    await page.getByRole("menuitem", { name: item }).click();
  };

  test("can be copied as a link, resent and cancelled after a confirmation", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await menu(page, "Copy invite link");
    await expect(page.getByText("Link copied")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
      /\/register\?invite=inv_\d+$/
    );

    await menu(page, "Resend invitation");
    await expect(page.getByText("Invitation resent")).toBeVisible();

    await menu(page, "Cancel invitation");
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(row(page, "e2e.invite@example.com")).toContainText(/pending/i);

    await menu(page, "Cancel invitation");
    await page.getByRole("alertdialog").getByRole("button", { name: "Cancel invitation" }).click();
    await expect(page.getByText("Invitation cancelled")).toBeVisible();
    await expect(row(page, "e2e.invite@example.com")).toContainText(/cancelled/i);
    await expect(
      row(page, "e2e.invite@example.com").getByRole("button", { name: /Actions for/ })
    ).toBeDisabled();
    await expect(page.getByRole("tab", { name: /Invitations/ })).toContainText("3");
  });

  test("marking one accepted adds a member, whose role and status can then change", async ({
    page,
  }) => {
    await menu(page, /Mark as accepted/);
    await expect(page.getByText("Invitation accepted")).toBeVisible();
    await page.getByRole("tab", { name: /Members/ }).click();
    await expect(listRows(page)).toHaveCount(13);
    const member = row(page, "e2e.invite@example.com");
    await expect(member).toBeVisible();

    await member.getByRole("button", { name: /Actions for/ }).click();
    await page.getByRole("menuitem", { name: "Change role" }).hover();
    await page.getByRole("menuitem", { name: "Admin", exact: true }).click();
    await expect(page.getByText("is now admin")).toBeVisible();
    await expect(member).toContainText(/admin/i);

    await member.getByRole("button", { name: /Actions for/ }).click();
    await page.getByRole("menuitem", { name: "Deactivate" }).click();
    await expect(member).toContainText(/inactive/i);
    await member.getByRole("button", { name: /Actions for/ }).click();
    await page.getByRole("menuitem", { name: "Reactivate" }).click();
    await expect(page.getByText("was reactivated")).toBeVisible();

    await member.getByRole("button", { name: /Actions for/ }).click();
    await page.getByRole("menuitem", { name: "Remove from team" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
    await expect(listRows(page)).toHaveCount(12);
  });
});

test("the last active admin can't be deactivated", async ({ page, context }) => {
  const staff = (await (await context.request.get("/api/staff?pageSize=100")).json()).items as {
    id: string;
    name: string;
    role: string;
    status: string;
  }[];
  const admins = staff.filter((member) => member.role === "admin" && member.status === "active");
  for (const other of admins.slice(1))
    await context.request.put(`/api/staff/${other.id}`, { data: { status: "inactive" } });
  await page.reload();
  await row(page, admins[0]!.name)
    .getByRole("button", { name: /Actions for/ })
    .click();
  await page.getByRole("menuitem", { name: "Deactivate" }).click();
  await expect(page.getByText("At least one active admin is required")).toBeVisible();
});
