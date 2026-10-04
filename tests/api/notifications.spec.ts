import { expect, test } from "./fixtures";
import type { APIRequestContext } from "@playwright/test";

const list = async (request: APIRequestContext) =>
  (await (await request.get("/api/notifications")).json()) as {
    items: { id: string; type: string; title: string; body: string; href: string; read: boolean }[];
    unread: number;
  };
const newCustomer = (name: string) => ({
  name,
  email: `${name.replace(/\W/g, "").toLowerCase()}@test.dev`,
  phone: "555-123-4567",
  city: "Austin",
  country: "USA",
  status: "active",
});
const product = {
  name: "Lamp",
  sku: "LMP-1",
  category: "Home",
  price: 20,
  description: "A lamp",
  status: "active",
};
const firstIds = async (admin: APIRequestContext) => ({
  customer: (await (await admin.get("/api/customers?pageSize=1")).json()).items[0].id as string,
  product: (await (await admin.get("/api/products?pageSize=1")).json()).items[0].id as string,
});

test.describe("the bell", () => {
  test("starts with five notifications, three unread, newest first", async ({ admin }) => {
    const { items, unread } = await list(admin);
    expect(items).toHaveLength(5);
    expect(unread).toBe(3);
    expect(items[0]).toMatchObject({ type: "newOrder", read: false });
    expect(items[0]!.href).toMatch(/^\/orders\//);
  });

  test("team news is only for admins", async ({ admin, manager, support }) => {
    expect((await list(admin)).items.some((item) => item.type === "teamInvites")).toBe(true);
    for (const role of [manager, support]) {
      const { items } = await list(role);
      expect(items).toHaveLength(4);
      expect(items.some((item) => item.type === "teamInvites")).toBe(false);
    }
  });

  test("needs a session", async ({ anon }) => {
    expect((await anon.get("/api/notifications")).status()).toBe(401);
  });
});

test.describe("what creates one", () => {
  test("a new order", async ({ admin }) => {
    const ids = await firstIds(admin);
    const order = await (
      await admin.post("/api/orders", {
        data: {
          customerId: ids.customer,
          status: "pending",
          notes: "",
          items: [{ productId: ids.product, quantity: 2 }],
        },
      })
    ).json();
    const { items, unread } = await list(admin);
    expect(items[0]).toMatchObject({
      type: "newOrder",
      title: `New order ${order.number}`,
      href: `/orders/${order.id}`,
    });
    expect(unread).toBe(4);
  });

  test("a new customer", async ({ admin }) => {
    await admin.post("/api/customers", { data: newCustomer("Cara Test") });
    expect((await list(admin)).items[0]).toMatchObject({
      type: "newCustomer",
      title: "Cara Test signed up",
    });
  });

  test("a product that drops below 20 in stock, once", async ({ admin }) => {
    const lamp = await (
      await admin.post("/api/products", { data: { ...product, stock: 50 } })
    ).json();
    const before = (await list(admin)).items.length;
    expect(before).toBe(5);

    await admin.put(`/api/products/${lamp.id}`, { data: { stock: 5 } });
    expect((await list(admin)).items[0]).toMatchObject({ type: "lowStock", body: "Only 5 left" });

    await admin.put(`/api/products/${lamp.id}`, { data: { stock: 3 } });
    await admin.put(`/api/products/${lamp.id}`, { data: { stock: 0 } });
    expect((await list(admin)).items).toHaveLength(6);

    await admin.put(`/api/products/${lamp.id}`, { data: { stock: 40 } });
    await admin.put(`/api/products/${lamp.id}`, { data: { stock: 0 } });
    const again = await list(admin);
    expect(again.items).toHaveLength(7);
    expect(again.items[0]!.body).toBe("Out of stock");
  });

  test("a product created low, but not a draft one", async ({ admin }) => {
    await admin.post("/api/products", {
      data: { ...product, name: "Draft lamp", stock: 2, status: "draft" },
    });
    expect((await list(admin)).items).toHaveLength(5);
    await admin.post("/api/products", { data: { ...product, name: "Tiny lamp", stock: 2 } });
    expect((await list(admin)).items[0]!.title).toBe("Low stock: Tiny lamp");
  });

  test("an accepted invitation, which only admins see", async ({ admin, manager }) => {
    const invitation = (await (await admin.get("/api/team/invitations?status=pending")).json())[0];
    await admin.post(`/api/team/invitations/${invitation.id}/accept`);
    expect((await list(admin)).items[0]).toMatchObject({
      type: "teamInvites",
      href: "/account/team",
    });
    expect((await list(manager)).items.every((item) => item.type !== "teamInvites")).toBe(true);
  });

  test("only the kinds switched on in Settings", async ({ admin }) => {
    const settings = await (await admin.get("/api/settings")).json();
    settings.notifications.newOrder.inApp = false;
    settings.notifications.lowStock.inApp = false;
    await admin.put("/api/settings", { data: settings });
    const ids = await firstIds(admin);
    const total = (await list(admin)).items.length;
    await admin.post("/api/orders", {
      data: {
        customerId: ids.customer,
        status: "pending",
        notes: "",
        items: [{ productId: ids.product, quantity: 1 }],
      },
    });
    await admin.post("/api/products", { data: { ...product, name: "Quiet lamp", stock: 1 } });
    expect((await list(admin)).items).toHaveLength(total);
    await admin.post("/api/customers", { data: newCustomer("Dan Test") });
    expect((await list(admin)).items).toHaveLength(total + 1);
  });

  test("the list shows 30 at most", async ({ admin }) => {
    for (let i = 0; i < 32; i++)
      await admin.post("/api/customers", {
        data: newCustomer(`Bulk ${String.fromCharCode(97 + (i % 26))}${i}`),
      });
    expect((await list(admin)).items).toHaveLength(30);
  });
});

test.describe("reading", () => {
  test("one at a time, and 404 for one that isn't there", async ({ admin }) => {
    const { items, unread } = await list(admin);
    const unreadOne = items.find((item) => !item.read)!;
    const read = await (await admin.post(`/api/notifications/${unreadOne.id}/read`)).json();
    expect(read.read).toBe(true);
    expect((await list(admin)).unread).toBe(unread - 1);
    expect((await admin.post("/api/notifications/ntf_nope/read")).status()).toBe(404);
  });

  test("a role can't read what it can't see", async ({ admin, manager }) => {
    const team = (await list(admin)).items.find((item) => item.type === "teamInvites")!;
    expect((await manager.post(`/api/notifications/${team.id}/read`)).status()).toBe(404);
  });

  test("all at once", async ({ admin }) => {
    const body = await (await admin.post("/api/notifications/read-all")).json();
    expect(body.unread).toBe(0);
    expect((await list(admin)).unread).toBe(0);
  });
});
