import { expect, test } from "./fixtures";

test.beforeEach(async ({ signInAs, app }) => {
  await signInAs("admin");
  await app.goto("/account/profile");
});

test.describe("personal info", () => {
  test("Save is off until something changes, and reset puts it back", async ({ page }) => {
    const save = page.getByRole("button", { name: "Save changes" });
    await expect(save).toBeDisabled();
    await page.getByLabel("Full name").fill("Someone Else");
    await expect(save).toBeEnabled();
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(page.getByLabel("Full name")).toHaveValue("Demo User");
    await expect(save).toBeDisabled();
  });

  test("checks the fields", async ({ page }) => {
    const save = page.getByRole("button", { name: "Save changes" });
    await page.getByLabel("Full name").fill("J");
    await save.click();
    await expect(page.getByText("Full name must be at least 2 characters")).toBeVisible();
    await page.getByLabel("Full name").fill("Jane Roe");
    await page.getByLabel("Email address").fill("not-an-email");
    await save.click();
    await expect(page.getByText("Enter a valid email address").first()).toBeVisible();
    await page.getByLabel("Email address").fill("jane@roe.test");
    await page.getByLabel("Bio").fill("x".repeat(201));
    await save.click();
    await expect(page.getByText("Keep the bio under 200 characters")).toBeVisible();
  });

  test("saving updates the sidebar and survives a reload", async ({ page, app }) => {
    await page.getByLabel("Full name").fill("Jane Roe");
    await page.getByLabel("Email address").fill("jane@roe.test");
    await page.getByLabel("Job title").fill("Store owner");
    await page.getByLabel("Bio").fill("Sells good things.");
    const avatars = page.getByRole("radio");
    await expect(avatars).toHaveCount(9);
    await expect(avatars.first()).toHaveAttribute("aria-checked", "true");
    await avatars.nth(3).click();
    await expect(avatars.nth(3)).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Profile updated")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
    await expect(page.locator("[data-slot='sidebar-footer']")).toContainText("Jane Roe");
    await expect(page.locator("[data-slot='sidebar-footer']")).toContainText("jane@roe.test");

    await app.goto("/account/profile");
    await expect(page.getByLabel("Full name")).toHaveValue("Jane Roe");
    await expect(page.getByLabel("Job title")).toHaveValue("Store owner");
    await expect(page.getByLabel("Bio")).toHaveValue("Sells good things.");
    await expect(page.getByRole("radio").first()).toHaveAttribute("aria-checked", "true");
  });

  test("keeps the sign-in's cookie lifetime", async ({ page, app, context }) => {
    const expires = async () =>
      (await context.cookies()).find((cookie) => cookie.name === "auth-session")!.expires;
    expect(await expires()).toBe(-1);
    await page.getByLabel("Job title").fill("Owner");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Profile updated")).toBeVisible();
    expect(await expires()).toBe(-1);
    expect(app).toBeTruthy();
  });
});

test.describe("password", () => {
  test("is checked, then saved", async ({ page }) => {
    const update = page.getByRole("button", { name: "Update password" });
    await update.click();
    await expect(page.getByText("Enter your current password")).toBeVisible();
    await page.getByLabel("Current password").fill("oldpassword1");
    await page.getByLabel("New password", { exact: true }).fill("oldpassword1");
    await page.getByLabel("Confirm new password").fill("oldpassword1");
    await update.click();
    await expect(page.getByText("Choose a password you haven't used here before")).toBeVisible();
    await page.getByLabel("New password", { exact: true }).fill("newpassword2");
    await update.click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await page.getByLabel("Confirm new password").fill("newpassword2");
    await update.click();
    await expect(page.getByText("Password updated").first()).toBeVisible();
    await expect(page.getByLabel("Current password")).toHaveValue("");
  });
});

test.describe("sessions", () => {
  test("sign out one device, then all the others, but never this one", async ({ page }) => {
    const card = page.locator("[data-slot='card']").filter({ hasText: "Active sessions" });
    await expect(card.getByText("This device")).toHaveCount(1);
    await expect(card.getByRole("button", { name: "Sign out", exact: true })).toHaveCount(3);
    await card.getByRole("button", { name: "Sign out", exact: true }).first().click();
    await expect(card.getByRole("button", { name: "Sign out", exact: true })).toHaveCount(2);
    await card.getByRole("button", { name: "Sign out other devices" }).click();
    await expect(page.getByText("Signed out your other devices")).toBeVisible();
    await expect(card.getByRole("button", { name: "Sign out other devices" })).toHaveCount(0);
    await expect(card.getByText("This device")).toHaveCount(1);
  });
});

test.describe("deleting the account", () => {
  test("signs you out", async ({ page }) => {
    await page.getByRole("button", { name: "Delete account" }).first().click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete account" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
