import { expect, test } from "./fixtures";

test.describe("signing in", () => {
  test("the demo button fills the form and signs in to the dashboard", async ({ page, app }) => {
    await app.goto("/login");
    await page.getByRole("button", { name: "Fill demo credentials" }).click();
    await expect(page.getByLabel("Email address")).toHaveValue("demo@analytics.test");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Welcome back, Demo/ })).toBeVisible();
  });

  test("shows what is wrong with the form", async ({ page, app }) => {
    await app.goto("/login");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText("Email address is required")).toBeVisible();
    await page.getByLabel("Email address").fill("nope");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("the password can be shown and hidden", async ({ page, app }) => {
    await app.goto("/login");
    const password = page.getByLabel("Password", { exact: true });
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
  });

  test("a team member signs in with their own role", async ({ page, app, sessions }) => {
    await app.goto("/login");
    await page.getByLabel("Email address").fill(sessions.emails.support);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.locator("[data-slot='sidebar-footer'] button").first().click();
    await expect(page.getByRole("menu")).toContainText(/support/i);
  });

  test("a deactivated team member sees why", async ({ page, app, sessions, request }) => {
    const cookie = `auth-session=${encodeURIComponent(JSON.stringify(sessions.admin))}`;
    const member = (
      await (
        await request.get(`/api/staff?search=${encodeURIComponent(sessions.emails.manager)}`, {
          headers: { cookie },
        })
      ).json()
    ).items[0];
    await request.put(`/api/staff/${member.id}`, {
      headers: { cookie },
      data: { status: "inactive" },
    });
    await app.goto("/login");
    await page.getByLabel("Email address").fill(sessions.emails.manager);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText(/deactivated/)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("remember me", () => {
  const sessionCookie = async (context: import("@playwright/test").BrowserContext) =>
    (await context.cookies()).find((cookie) => cookie.name === "auth-session");

  test("lasts 30 days when ticked", async ({ page, app, context }) => {
    await app.goto("/login");
    await page.getByRole("button", { name: "Fill demo credentials" }).click();
    await page.getByLabel("Remember me").check();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    const cookie = await sessionCookie(context);
    expect(Math.round((cookie!.expires - Date.now() / 1000) / 86_400)).toBe(30);
  });

  test("ends with the browser session otherwise", async ({ page, app, context }) => {
    await app.goto("/login");
    await page.getByRole("button", { name: "Fill demo credentials" }).click();
    await page.getByLabel("Remember me").uncheck();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    expect((await sessionCookie(context))!.expires).toBe(-1);
  });
});

test.describe("registering and forgotten passwords", () => {
  test("registering signs in", async ({ page, app }) => {
    await app.goto("/register");
    await page.getByRole("button", { name: "Fill demo data" }).click();
    await expect(page.getByLabel("Full name")).toHaveValue("Demo User");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("registering checks the terms and that the passwords match", async ({ page, app }) => {
    await app.goto("/register");
    await page.getByLabel("Full name").fill("Jane Doe");
    await page.getByLabel("Email address").fill("jane@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("different123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(page.getByText("You must accept the terms")).toBeVisible();
  });

  test("forgot password confirms by toast", async ({ page, app }) => {
    await app.goto("/forgot-password");
    await page.getByLabel("Email address").fill("jane@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Check your inbox")).toBeVisible();
  });
});

test.describe("protected pages and where you land", () => {
  test("signed-out visitors go to the login page", async ({ page, app }) => {
    await app.goto("/orders");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("after signing in you land on the page you asked for", async ({ page, app }) => {
    await app.goto("/orders");
    await page.getByRole("button", { name: "Fill demo credentials" }).click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/orders$/);
  });

  test("signed-in visitors are sent away from the login pages", async ({ page, app, signInAs }) => {
    await signInAs("admin");
    for (const path of ["/login", "/register", "/forgot-password"]) {
      await app.goto(path);
      await expect(page, path).toHaveURL(/\/dashboard$/);
    }
  });

  test("logging out returns to the login page, and the next sign-in returns to where you were", async ({
    page,
    app,
    signInAs,
  }) => {
    await signInAs("admin");
    await app.goto("/products");
    await page.locator("[data-slot='sidebar-footer'] button").first().click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await app.goto("/orders");
    await expect(page).toHaveURL(/\/login$/);
    await page.getByRole("button", { name: "Fill demo credentials" }).click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/orders$/);
  });

  test("the root path goes to the dashboard", async ({ page, app, signInAs }) => {
    await signInAs("admin");
    await app.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe("a stale last-visited page", () => {
  // Looking up a path that isn't a page makes Vue Router warn, which is what is being tested.
  test.use({ allowedConsole: /VUE_ROUTER_R0004|No match found/ });

  test("is ignored, so you land on the dashboard", async ({ page, app, context, baseURL }) => {
    await context.addCookies([
      { name: "last-visited", value: encodeURIComponent("/sw.js?v0.0.5"), url: baseURL! },
    ]);
    await app.goto("/login");
    await page.getByRole("button", { name: "Fill demo credentials" }).click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
