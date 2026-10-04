import { expect, test } from "./fixtures";

// A missing page logs a router warning, and the request for it a 404.
test.use({ allowedConsole: /VUE_ROUTER_R0004|No match found/ });

test.describe("the 404 page", () => {
  test("is a real 404 for browser extension paths too, and not remembered", async ({
    page,
    app,
    request,
  }) => {
    expect((await request.get("/sw.js?v0.0.5")).status()).toBe(404);
    expect((await request.get("/account/nope")).status()).toBe(404);

    const response = await app.goto("/sw.js?v0.0.5");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByText("404", { exact: true })).toBeVisible();
    await expect(page).toHaveTitle("Page not found · Analytics");
  });

  test("offers sign-in when signed out, and after signing in lands on the dashboard", async ({
    page,
    app,
  }) => {
    await app.goto("/definitely/not/here");
    await expect(page.getByRole("button", { name: "Try again" })).toHaveCount(0);
    await page.getByRole("button", { name: "Go to sign in" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.getByRole("button", { name: "Fill demo credentials" }).click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("offers the dashboard when signed in", async ({ page, app, signInAs }) => {
    await signInAs("admin");
    const response = await app.goto("/definitely/not/here");
    expect(response?.status()).toBe(404);
    await page.getByRole("button", { name: "Back to dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("shows for a missing page reached inside the app", async ({ page, app, signInAs }) => {
    await signInAs("admin");
    await app.goto("/dashboard");
    await page.evaluate(() =>
      (window as unknown as { useNuxtApp: () => { $router: { push: (to: string) => void } } })
        .useNuxtApp()
        .$router.push("/nope-in-app")
    );
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("has one h1 and a main landmark, and fits a phone", async ({ page, app }) => {
    await app.goto("/nope");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await app.viewport(375, 700);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

  test("API routes that don't exist stay JSON 404s, or 401 without a session", async ({
    context,
    request,
    signInAs,
  }) => {
    expect((await request.get("/api/nothing")).status()).toBe(401);
    await signInAs("admin");
    const response = await context.request.get("/api/nothing");
    expect(response.status()).toBe(404);
    expect(response.headers()["content-type"]).toContain("json");
  });
});
