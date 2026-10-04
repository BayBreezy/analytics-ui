import { test as base, expect, type Page, type Response } from "@playwright/test";
import { BASE_URL } from "../baseUrl";

export { expect };

export type Role = "admin" | "manager" | "support";

interface Session {
  user: { id: string; name: string; email: string; avatar: string; role: string };
  token: string;
}

interface WorkerFixtures {
  /** Signing in is slow on purpose (to show loading states), so it is done once per worker. */
  sessions: Record<Role, Session> & { emails: Record<Exclude<Role, "admin">, string> };
}

interface Fixtures {
  /** Console output that is expected in a test (a 404 page logs a router warning, for example). */
  allowedConsole: RegExp;
  /** Fails the test on page errors, console errors and Vue warnings. */
  diagnostics: void;
  /** Starts every test from the original sample data. */
  fresh: void;
  /** Signs the browser in as someone, without going through the form. */
  signInAs: (role: Role) => Promise<void>;
  /** Page helpers that wait for Nuxt to hydrate. */
  app: {
    goto: (path: string) => Promise<Response | null>;
    /** The path and query of the current page. */
    path: () => string;
    /** Sets the viewport and waits for the layout to settle. */
    viewport: (width: number, height?: number) => Promise<void>;
  };
}

const hydrated = (page: Page) =>
  page.waitForFunction(() => {
    const nuxt = (window as unknown as { useNuxtApp?: () => { isHydrating: boolean } }).useNuxtApp;
    return Boolean(nuxt) && !nuxt!().isHydrating;
  });

async function login(request: import("@playwright/test").APIRequestContext, email: string) {
  const response = await request.post("/api/auth/login", {
    data: { email, password: "password123" },
  });
  expect(response.status(), `signing in as ${email}`).toBe(200);
  return (await response.json()) as Session;
}

export const test = base.extend<Fixtures, WorkerFixtures>({
  sessions: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({ baseURL: BASE_URL });
      const admin = await login(request, "demo@analytics.test");
      const cookie = `auth-session=${encodeURIComponent(JSON.stringify(admin))}`;
      const staff = await request.get("/api/staff?pageSize=100", { headers: { cookie } });
      const { items } = (await staff.json()) as {
        items: { email: string; role: string; status: string }[];
      };
      const pick = (role: string) =>
        items.find((item) => item.role === role && item.status === "active")!.email;
      const emails = { manager: pick("manager"), support: pick("support") };
      const sessions = {
        admin,
        manager: await login(request, emails.manager),
        support: await login(request, emails.support),
        emails,
      };
      await request.dispose();
      await use(sessions);
    },
    { scope: "worker" },
  ],

  // Matches nothing, until a test says which messages are fine.
  allowedConsole: [/(?!)/, { option: true }],

  diagnostics: [
    async ({ page, allowedConsole }, use) => {
      const problems: string[] = [];
      // A 4xx or 5xx from the API shows up in the console as a failed resource. Tests that cause one
      // on purpose (a validation error, a 409) are fine, a 5xx never is.
      const expected = [
        /status of 4\d\d/,
        /Download the Vue Devtools/,
        /\[vite\]/,
        // The error overlay of Nuxt's dev server, which doesn't exist in a production build.
        /iframe which has both allow-scripts and allow-same-origin/,
        allowedConsole,
      ];
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() !== "error" && message.type() !== "warning") return;
        const text = message.text();
        if (!expected.some((pattern) => pattern.test(text)))
          problems.push(`${message.type()}: ${text.slice(0, 300)}`);
      });
      await use();
      expect(problems, "console problems").toEqual([]);
    },
    { auto: true },
  ],

  fresh: [
    async ({ playwright, sessions }, use) => {
      const request = await playwright.request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          cookie: `auth-session=${encodeURIComponent(JSON.stringify(sessions.admin))}`,
        },
      });
      await request.post("/api/settings/reset");
      await request.dispose();
      await use();
    },
    { auto: true },
  ],

  signInAs: async ({ context, sessions }, use) => {
    await use(async (role) => {
      await context.addCookies([
        {
          name: "auth-session",
          value: encodeURIComponent(JSON.stringify({ ...sessions[role], remember: false })),
          url: BASE_URL,
        },
      ]);
    });
  },

  app: async ({ page }, use) => {
    await use({
      goto: async (path) => {
        const response = await page.goto(path);
        await hydrated(page);
        return response;
      },
      path: () => {
        const url = new URL(page.url());
        return url.pathname + url.search;
      },
      viewport: async (width, height = 900) => {
        await page.setViewportSize({ width, height });
      },
    });
  },
});
