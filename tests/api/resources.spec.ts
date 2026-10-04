import { expect, test } from "./fixtures";

const customer = {
  name: "Cara Test",
  email: "cara@test.dev",
  phone: "555-123-4567",
  city: "Austin",
  country: "USA",
  status: "active",
};
const product = {
  name: "Desk lamp",
  sku: "LMP-001",
  category: "Home",
  price: 20,
  stock: 50,
  status: "active",
  description: "A lamp",
};

test.describe("lists", () => {
  test("have the seeded totals and paginate", async ({ admin }) => {
    const totals: Record<string, number> = { customers: 48, products: 60, orders: 120, staff: 12 };
    for (const [name, total] of Object.entries(totals)) {
      const body = await (await admin.get(`/api/${name}`)).json();
      expect(body).toMatchObject({
        total,
        page: 1,
        pageSize: 10,
        pageCount: Math.ceil(total / 10),
      });
      expect(body.items).toHaveLength(10);
    }
    const second = await (await admin.get("/api/customers?page=2&pageSize=25")).json();
    expect(second).toMatchObject({ page: 2, pageSize: 25, pageCount: 2 });
    expect(second.items).toHaveLength(23);
  });

  test("search by name, email and other text", async ({ admin }) => {
    const first = (await (await admin.get("/api/customers?pageSize=1")).json()).items[0];
    const byEmail = await (
      await admin.get(`/api/customers?search=${encodeURIComponent(first.email.toUpperCase())}`)
    ).json();
    expect(byEmail.items.map((item: { id: string }) => item.id)).toContain(first.id);
    const none = await (await admin.get("/api/customers?search=zzzzqqqq")).json();
    expect(none).toMatchObject({ total: 0, items: [], pageCount: 1 });
    const orders = await (await admin.get("/api/orders?search=%23ORD-4821")).json();
    expect(orders.items[0].number).toBe("#ORD-4821");
  });

  test("filter, and ignore filters that don't apply", async ({ admin }) => {
    const inactive = await (await admin.get("/api/customers?status=inactive&pageSize=100")).json();
    expect(inactive.total).toBeGreaterThan(0);
    expect(inactive.items.every((item: { status: string }) => item.status === "inactive")).toBe(
      true
    );
    const home = await (await admin.get("/api/products?category=Home&pageSize=100")).json();
    expect(home.items.every((item: { category: string }) => item.category === "Home")).toBe(true);
    const admins = await (await admin.get("/api/staff?role=admin&pageSize=100")).json();
    expect(admins.items.every((item: { role: string }) => item.role === "admin")).toBe(true);
    const ignored = await (await admin.get("/api/customers?category=Home")).json();
    expect(ignored.total).toBe(48);
  });

  test("filter a customer's orders", async ({ admin }) => {
    const order = (await (await admin.get("/api/orders?pageSize=1")).json()).items[0];
    const mine = await (
      await admin.get(`/api/orders?customerId=${order.customer.id}&pageSize=100`)
    ).json();
    expect(mine.total).toBeGreaterThan(0);
    expect(
      mine.items.every(
        (item: { customer: { id: string } }) => item.customer.id === order.customer.id
      )
    ).toBe(true);
  });

  test("sort in either direction, newest first by default", async ({ admin }) => {
    const asc = (
      await (await admin.get("/api/products?sort=price&order=asc&pageSize=100")).json()
    ).items.map((item: { price: number }) => item.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = (
      await (await admin.get("/api/products?sort=price&order=desc&pageSize=100")).json()
    ).items.map((item: { price: number }) => item.price);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    const dates = (await (await admin.get("/api/customers?pageSize=100")).json()).items.map(
      (item: { createdAt: string }) => item.createdAt
    );
    expect(dates).toEqual([...dates].sort().reverse());
    expect((await admin.get("/api/customers?sort=notAField")).status()).toBe(200);
  });

  test("customers carry their order count and spend", async ({ admin }) => {
    const first = (await (await admin.get("/api/customers?pageSize=1")).json()).items[0];
    expect(first.ordersCount).toBeGreaterThanOrEqual(0);
    expect(typeof first.totalSpent).toBe("number");
  });

  test("reject a bad query", async ({ admin }) => {
    for (const query of ["pageSize=101", "page=0", "order=sideways", "pageSize=abc"]) {
      expect((await admin.get(`/api/customers?${query}`)).status(), query).toBe(400);
    }
  });

  test("unknown resources are 404", async ({ admin }) => {
    expect((await admin.get("/api/nothing")).status()).toBe(404);
    expect((await admin.get("/api/nothing/abc")).status()).toBe(404);
  });
});

test.describe("one record", () => {
  test("get, and 404 for an unknown id", async ({ admin }) => {
    const first = (await (await admin.get("/api/products?pageSize=1")).json()).items[0];
    expect((await (await admin.get(`/api/products/${first.id}`)).json()).sku).toBe(first.sku);
    const missing = await admin.get("/api/products/prd_9999");
    expect(missing.status()).toBe(404);
    expect((await missing.json()).message).toContain("prd_9999");
  });

  test("create returns 201 with an id and shows up first in the list", async ({ admin }) => {
    const response = await admin.post("/api/customers", { data: customer });
    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created).toMatchObject({ ...customer, ordersCount: 0 });
    expect(created.id).toMatch(/^cus_/);
    expect(created.avatar).toMatch(/^https?:/);
    const list = await (await admin.get("/api/customers")).json();
    expect(list.total).toBe(49);
    expect(list.items[0].id).toBe(created.id);
  });

  test("create answers with a 400 and the field errors", async ({ admin }) => {
    const response = await admin.post("/api/customers", {
      data: { ...customer, name: "J", phone: "1" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.data).toMatchObject({
      name: ["Name must be at least 2 characters"],
      phone: ["Enter a valid phone number"],
    });
  });

  test("update takes a partial body and keeps id and creation date", async ({ admin }) => {
    const before = (await (await admin.get("/api/customers?pageSize=1")).json()).items[0];
    const after = await (
      await admin.put(`/api/customers/${before.id}`, {
        data: { status: "inactive", city: "Paris" },
      })
    ).json();
    expect(after).toMatchObject({
      id: before.id,
      createdAt: before.createdAt,
      status: "inactive",
      city: "Paris",
      name: before.name,
    });
    expect(
      (await admin.put(`/api/customers/${before.id}`, { data: { status: "gone" } })).status()
    ).toBe(400);
    expect((await admin.put("/api/customers/cus_9999", { data: { city: "Paris" } })).status()).toBe(
      404
    );
  });

  test("delete removes it, once", async ({ admin }) => {
    const first = (await (await admin.get("/api/products?pageSize=1")).json()).items[0];
    expect((await admin.delete(`/api/products/${first.id}`)).status()).toBe(200);
    expect((await admin.get(`/api/products/${first.id}`)).status()).toBe(404);
    expect((await admin.delete(`/api/products/${first.id}`)).status()).toBe(404);
    expect((await (await admin.get("/api/products")).json()).total).toBe(59);
  });

  test("a product validates its SKU and numbers", async ({ admin }) => {
    expect((await admin.post("/api/products", { data: product })).status()).toBe(201);
    expect(
      (await admin.post("/api/products", { data: { ...product, sku: "bad sku!" } })).status()
    ).toBe(400);
    expect((await admin.post("/api/products", { data: { ...product, price: -1 } })).status()).toBe(
      400
    );
    expect((await admin.post("/api/products", { data: { ...product, stock: 1.5 } })).status()).toBe(
      400
    );
  });
});

test.describe("orders", () => {
  const body = (customerId: string, items: { productId: string; quantity: number }[]) => ({
    customerId,
    items,
    status: "pending",
    notes: "",
  });

  test("are priced from the products and numbered in sequence", async ({ admin }) => {
    const customerId = (await (await admin.get("/api/customers?pageSize=1")).json()).items[0].id;
    const [a, b] = (await (await admin.get("/api/products?pageSize=2")).json()).items;
    const response = await admin.post("/api/orders", {
      data: body(customerId, [
        { productId: a.id, quantity: 2 },
        { productId: b.id, quantity: 1 },
      ]),
    });
    expect(response.status()).toBe(201);
    const order = await response.json();
    expect(order.number).toBe("#ORD-4822");
    expect(order.items).toHaveLength(2);
    expect(order.total).toBeCloseTo(a.price * 2 + b.price, 2);
    expect(order.customer.id).toBe(customerId);
    const next = await (
      await admin.post("/api/orders", {
        data: body(customerId, [{ productId: a.id, quantity: 1 }]),
      })
    ).json();
    expect(next.number).toBe("#ORD-4823");
  });

  test("need a real customer and real products", async ({ admin }) => {
    const productId = (await (await admin.get("/api/products?pageSize=1")).json()).items[0].id;
    const customerId = (await (await admin.get("/api/customers?pageSize=1")).json()).items[0].id;
    const noCustomer = await admin.post("/api/orders", {
      data: body("cus_9999", [{ productId, quantity: 1 }]),
    });
    expect(noCustomer.status()).toBe(400);
    expect((await noCustomer.json()).message).toContain("cus_9999");
    expect(
      (
        await admin.post("/api/orders", {
          data: body(customerId, [{ productId: "prd_9999", quantity: 1 }]),
        })
      ).status()
    ).toBe(400);
    expect((await admin.post("/api/orders", { data: body(customerId, []) })).status()).toBe(400);
    expect(
      (
        await admin.post("/api/orders", { data: body(customerId, [{ productId, quantity: 100 }]) })
      ).status()
    ).toBe(400);
  });

  test("keep the price a line was ordered at when edited", async ({ admin }) => {
    const order = (await (await admin.get("/api/orders?pageSize=1")).json()).items[0];
    const line = order.items[0];
    await admin.put(`/api/products/${line.productId}`, { data: { price: 9999 } });
    const edited = await (
      await admin.put(`/api/orders/${order.id}`, {
        data: {
          items: order.items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      })
    ).json();
    expect(edited.items[0].price).toBe(line.price);
    expect(edited.number).toBe(order.number);
    expect(edited.total).toBeCloseTo(order.total, 2);
  });

  test("change status on their own", async ({ admin }) => {
    const order = (await (await admin.get("/api/orders?pageSize=1")).json()).items[0];
    const updated = await (
      await admin.put(`/api/orders/${order.id}`, { data: { status: "refunded" } })
    ).json();
    expect(updated.status).toBe("refunded");
    expect(updated.total).toBe(order.total);
  });
});

test.describe("staff", () => {
  const activeAdmins = async (admin: import("@playwright/test").APIRequestContext) =>
    (await (await admin.get("/api/staff?role=admin&status=active&pageSize=100")).json()).items as {
      id: string;
    }[];

  test("the last active admin can't be removed, demoted or deactivated", async ({ admin }) => {
    const admins = await activeAdmins(admin);
    expect(admins).toHaveLength(2);
    expect((await admin.delete(`/api/staff/${admins[0]!.id}`)).status()).toBe(200);
    const last = admins[1]!.id;

    const removal = await admin.delete(`/api/staff/${last}`);
    expect(removal.status()).toBe(400);
    expect((await removal.json()).message).toContain("At least one active admin");
    expect((await admin.put(`/api/staff/${last}`, { data: { role: "manager" } })).status()).toBe(
      400
    );
    expect((await admin.put(`/api/staff/${last}`, { data: { status: "inactive" } })).status()).toBe(
      400
    );
    expect(
      (await admin.put(`/api/staff/${last}`, { data: { phone: "555-999-0000" } })).status()
    ).toBe(200);
  });

  test("a second admin makes it possible again", async ({ admin }) => {
    const [first, second] = await activeAdmins(admin);
    expect(
      (await admin.put(`/api/staff/${first!.id}`, { data: { role: "manager" } })).status()
    ).toBe(200);
    expect(
      (await admin.put(`/api/staff/${second!.id}`, { data: { role: "manager" } })).status()
    ).toBe(400);
    const manager = (await (await admin.get("/api/staff?role=manager&pageSize=1")).json()).items[0];
    expect(
      (await admin.put(`/api/staff/${manager.id}`, { data: { role: "admin" } })).status()
    ).toBe(200);
    expect(
      (await admin.put(`/api/staff/${second!.id}`, { data: { role: "support" } })).status()
    ).toBe(200);
  });
});
