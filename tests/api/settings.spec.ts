import { expect, test } from "./fixtures";

test.describe("settings", () => {
  test("start with the sample values", async ({ admin }) => {
    const settings = await (await admin.get("/api/settings")).json();
    expect(settings).toMatchObject({
      storeName: "Analytics",
      supportEmail: "support@analytics.test",
      timezone: "America/New_York",
    });
    expect(Object.keys(settings.notifications).sort()).toEqual([
      "lowStock",
      "newCustomer",
      "newOrder",
      "teamInvites",
      "weeklyReport",
    ]);
  });

  test("are saved and read back", async ({ admin }) => {
    const base = await (await admin.get("/api/settings")).json();
    const saved = await admin.put("/api/settings", {
      data: { ...base, storeName: "Acme Shop", timezone: "Europe/Paris" },
    });
    expect(saved.status()).toBe(200);
    expect(await (await admin.get("/api/settings")).json()).toMatchObject({
      storeName: "Acme Shop",
      timezone: "Europe/Paris",
    });
  });

  test("reject bad values", async ({ admin }) => {
    const base = await (await admin.get("/api/settings")).json();
    for (const patch of [
      { storeName: "A" },
      { timezone: "Mars/Base" },
      { supportEmail: "bad" },
      { notifications: { newOrder: { email: true } } },
    ]) {
      expect(
        (await admin.put("/api/settings", { data: { ...base, ...patch } })).status(),
        JSON.stringify(patch)
      ).toBe(400);
    }
  });

  test("can be read by every role but only changed by an admin", async ({ manager, support }) => {
    for (const role of [manager, support]) {
      const settings = await (await role.get("/api/settings")).json();
      expect((await role.put("/api/settings", { data: settings })).status()).toBe(403);
    }
  });
});

test.describe("reset", () => {
  test("puts every collection, the settings and the sessions back", async ({ admin }) => {
    const base = await (await admin.get("/api/settings")).json();
    await admin.put("/api/settings", { data: { ...base, storeName: "Changed" } });
    await admin.post("/api/staff", {
      data: {
        name: "Temp Person",
        email: "temp@x.test",
        phone: "555-123-4567",
        role: "support",
        status: "active",
      },
    });
    await admin.delete("/api/account/sessions/others");
    await admin.post("/api/support/tickets", {
      data: {
        subject: "Hello there",
        category: "other",
        priority: "low",
        message: "A message long enough.",
      },
    });
    expect((await (await admin.get("/api/staff")).json()).total).toBe(13);

    expect((await admin.post("/api/settings/reset")).status()).toBe(200);

    expect((await (await admin.get("/api/settings")).json()).storeName).toBe("Analytics");
    for (const [name, total] of [
      ["customers", 48],
      ["products", 60],
      ["orders", 120],
      ["staff", 12],
    ] as const) {
      expect((await (await admin.get(`/api/${name}`)).json()).total, name).toBe(total);
    }
    expect(await (await admin.get("/api/account/sessions")).json()).toHaveLength(4);
    expect(await (await admin.get("/api/team/invitations")).json()).toHaveLength(6);
    expect(await (await admin.get("/api/support/tickets")).json()).toHaveLength(3);
  });

  test("is for admins only", async ({ manager, support }) => {
    expect((await manager.post("/api/settings/reset")).status()).toBe(403);
    expect((await support.post("/api/settings/reset")).status()).toBe(403);
  });
});
