import {
  test as base,
  expect,
  type APIRequestContext,
  type PlaywrightWorkerArgs,
} from "@playwright/test";
import { BASE_URL } from "../baseUrl";

export { expect };

export type Role = "admin" | "manager" | "support";

interface Fixtures {
  /** Not signed in. */
  anon: APIRequestContext;
  /** The demo account, an admin. */
  admin: APIRequestContext;
  /** An active manager from the staff list. */
  manager: APIRequestContext;
  /** An active support member from the staff list. */
  support: APIRequestContext;
  /** The email of an active team member with that role. */
  team: { email: (role: "manager" | "support") => string };
  /** Starts every test from the original sample data. */
  fresh: void;
  /** Signs in as any email and returns a request context that carries the session. */
  signIn: (email: string) => Promise<APIRequestContext>;
}

interface WorkerFixtures {
  /** Signing in is slow on purpose (to show loading states), so it is done once per worker. */
  sessions: {
    admin: string;
    manager: string;
    support: string;
    managerEmail: string;
    supportEmail: string;
  };
}

/** The `auth-session` cookie the app would set, built from the sign-in response. */
export async function sessionCookie(request: APIRequestContext, email: string) {
  const response = await request.post("/api/auth/login", {
    data: { email, password: "password123" },
  });
  expect(response.status(), `signing in as ${email}`).toBe(200);
  return `auth-session=${encodeURIComponent(JSON.stringify(await response.json()))}`;
}

type Sessions = WorkerFixtures["sessions"];

/** A request context that already carries the session of someone with that role. */
const signedIn =
  (role: "admin" | "manager" | "support") =>
  async (
    {
      playwright,
      sessions,
    }: { playwright: PlaywrightWorkerArgs["playwright"]; sessions: Sessions },
    use: (context: APIRequestContext) => Promise<void>
  ) => {
    const context = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { cookie: sessions[role] },
    });
    await use(context);
    await context.dispose();
  };

export const test = base.extend<Fixtures, WorkerFixtures>({
  sessions: [
    async ({ playwright }, use) => {
      const plain = await playwright.request.newContext({ baseURL: BASE_URL });
      const admin = await sessionCookie(plain, "demo@analytics.test");
      const staff = await plain.get("/api/staff?pageSize=100", { headers: { cookie: admin } });
      const { items } = (await staff.json()) as {
        items: { email: string; role: string; status: string }[];
      };
      const pick = (role: string) => {
        const member = items.find((item) => item.role === role && item.status === "active");
        if (!member) throw new Error(`No active ${role} in the sample data`);
        return member.email;
      };
      const [managerEmail, supportEmail] = [pick("manager"), pick("support")];
      const sessions = {
        admin,
        manager: await sessionCookie(plain, managerEmail),
        support: await sessionCookie(plain, supportEmail),
        managerEmail,
        supportEmail,
      };
      await plain.dispose();
      await use(sessions);
    },
    { scope: "worker" },
  ],

  anon: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: BASE_URL });
    await use(context);
    await context.dispose();
  },

  signIn: async ({ playwright }, use) => {
    const contexts: APIRequestContext[] = [];
    await use(async (email) => {
      const plain = await playwright.request.newContext({ baseURL: BASE_URL });
      const cookie = await sessionCookie(plain, email);
      await plain.dispose();
      const context = await playwright.request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: { cookie },
      });
      contexts.push(context);
      return context;
    });
    await Promise.all(contexts.map((context) => context.dispose()));
  },

  admin: signedIn("admin"),
  manager: signedIn("manager"),
  support: signedIn("support"),

  team: async ({ sessions }, use) =>
    use({ email: (role) => (role === "manager" ? sessions.managerEmail : sessions.supportEmail) }),

  fresh: [
    async ({ admin }, use) => {
      await admin.post("/api/settings/reset");
      await use();
    },
    { auto: true },
  ],
});
