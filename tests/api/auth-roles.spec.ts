import { expect, test } from "./fixtures";

const READS = [
  "/api/customers",
  "/api/staff",
  "/api/settings",
  "/api/billing",
  "/api/dashboard/stats",
  "/api/account/sessions",
  "/api/analytics/overview",
  "/api/support/tickets",
  "/api/team/invitations",
  "/api/notifications",
  "/api/search?q=ab",
];

test.describe("sessions", () => {
  test("every API route except sign-in needs a session", async ({ anon }) => {
    for (const path of READS) expect((await anon.get(path)).status(), path).toBe(401);
    expect((await anon.post("/api/customers", { data: {} })).status()).toBe(401);
  });

  test("sign-in, registration and forgot password stay open", async ({ anon }) => {
    expect(
      (await anon.post("/api/auth/forgot-password", { data: { email: "a@b.test" } })).status()
    ).toBe(200);
    expect((await anon.post("/api/auth/logout")).status()).toBe(200);
  });

  test("Nuxt's own /api/_ routes aren't blocked", async ({ anon }) => {
    expect((await anon.get("/api/_nuxt_icon/lucide.json?icons=x")).status()).not.toBe(401);
  });
});

test.describe("sign-in", () => {
  test("the demo account is a stable admin", async ({ anon }) => {
    const body = await (
      await anon.post("/api/auth/login", {
        data: { email: "demo@analytics.test", password: "password123" },
      })
    ).json();
    expect(body.user).toMatchObject({ id: "demo-user", name: "Demo User", role: "admin" });
    expect(body.token).toMatch(/^mock_/);
  });

  test("an unknown email is a demo admin named after the address", async ({ anon }) => {
    const body = await (
      await anon.post("/api/auth/login", {
        data: { email: "someone.new@example.com", password: "password123" },
      })
    ).json();
    expect(body.user).toMatchObject({ role: "admin", name: "Someone New" });
  });

  test("a team member's email signs in with their role, whatever the case", async ({
    anon,
    team,
  }) => {
    const email = team.email("manager");
    const body = await (
      await anon.post("/api/auth/login", {
        data: { email: email.toUpperCase(), password: "password123" },
      })
    ).json();
    expect(body.user).toMatchObject({ role: "manager", email });
    expect(body.user.id).toMatch(/^stf_/);
  });

  test("a deactivated team member is refused", async ({ admin, anon, team }) => {
    const email = team.email("manager");
    const staff = (await (await admin.get(`/api/staff?search=${encodeURIComponent(email)}`)).json())
      .items[0];
    await admin.put(`/api/staff/${staff.id}`, { data: { status: "inactive" } });
    const response = await anon.post("/api/auth/login", {
      data: { email, password: "password123" },
    });
    expect(response.status()).toBe(403);
    expect((await response.json()).message).toContain("deactivated");
  });

  test("rejects a malformed email or a short password", async ({ anon }) => {
    expect(
      (
        await anon.post("/api/auth/login", { data: { email: "nope", password: "password123" } })
      ).status()
    ).toBe(400);
    expect(
      (
        await anon.post("/api/auth/login", { data: { email: "a@b.test", password: "short" } })
      ).status()
    ).toBe(400);
  });
});

test.describe("manager", () => {
  test("reads the store, the staff list, analytics and settings", async ({ manager }) => {
    for (const path of [
      "/api/customers",
      "/api/orders",
      "/api/products",
      "/api/staff",
      "/api/analytics/overview",
      "/api/analytics/statistics",
      "/api/analytics/trends",
      "/api/dashboard/stats",
      "/api/settings",
    ]) {
      expect((await manager.get(path)).status(), path).toBe(200);
    }
  });

  test("creates and deletes customers", async ({ manager }) => {
    const created = await manager.post("/api/customers", {
      data: {
        name: "Cara Test",
        email: "cara@test.dev",
        phone: "555-123-4567",
        city: "Austin",
        country: "USA",
        status: "active",
      },
    });
    expect(created.status()).toBe(201);
    expect((await manager.delete(`/api/customers/${(await created.json()).id}`)).status()).toBe(
      200
    );
  });

  test("can't change staff, the team, billing or store settings", async ({
    manager,
    team,
    admin,
  }) => {
    const member = (await (await admin.get("/api/staff?pageSize=1")).json()).items[0];
    const forbidden = [
      manager.post("/api/staff", {
        data: {
          name: "New Person",
          email: "np@x.test",
          phone: "555-123-4567",
          role: "support",
          status: "active",
        },
      }),
      manager.put(`/api/staff/${member.id}`, { data: { status: "inactive" } }),
      manager.delete(`/api/staff/${member.id}`),
      manager.get("/api/team/invitations"),
      manager.post("/api/team/invitations", { data: { email: "q@x.test", role: "support" } }),
      manager.get("/api/billing"),
      manager.get("/api/billing/invoices"),
      manager.post("/api/billing/subscription/cancel"),
      manager.put("/api/billing/subscription", { data: { planId: "scale", interval: "yearly" } }),
      manager.post("/api/settings/reset"),
    ];
    for (const response of await Promise.all(forbidden)) expect(response.status()).toBe(403);
    const settings = await (await manager.get("/api/settings")).json();
    expect((await manager.put("/api/settings", { data: settings })).status()).toBe(403);
    expect(team.email("manager")).toBeTruthy();
  });

  test("403 names the role", async ({ manager }) => {
    const response = await manager.get("/api/billing");
    expect((await response.json()).message).toContain("manager");
  });
});

test.describe("support", () => {
  test("reads customers, orders, products and the dashboard", async ({ support }) => {
    for (const path of [
      "/api/customers",
      "/api/orders",
      "/api/products",
      "/api/dashboard/orders",
      "/api/settings",
    ]) {
      expect((await support.get(path)).status(), path).toBe(200);
    }
  });

  test("can't read staff, analytics, the team or billing", async ({ support }) => {
    for (const path of [
      "/api/staff",
      "/api/analytics/overview",
      "/api/analytics/statistics",
      "/api/analytics/trends",
      "/api/team/invitations",
      "/api/billing",
    ]) {
      expect((await support.get(path)).status(), path).toBe(403);
    }
  });

  test("works on orders but can't change customers or products", async ({ support }) => {
    const order = (await (await support.get("/api/orders?pageSize=1")).json()).items[0];
    const updated = await support.put(`/api/orders/${order.id}`, { data: { status: "shipped" } });
    expect(updated.status()).toBe(200);
    expect((await updated.json()).status).toBe("shipped");
    expect((await support.post("/api/customers", { data: {} })).status()).toBe(403);
    expect(
      (await support.put("/api/products/prd_2001", { data: { status: "draft" } })).status()
    ).toBe(403);
  });

  test("keeps their own profile, sessions and support requests", async ({ support }) => {
    expect((await support.get("/api/account/sessions")).status()).toBe(200);
    expect((await support.get("/api/support/tickets")).status()).toBe(200);
  });
});
