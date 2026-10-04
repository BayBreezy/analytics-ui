import { expect, test } from "./fixtures";

test.describe("search", () => {
  test("needs a session and a query of 2 to 50 characters", async ({ anon, admin }) => {
    expect((await anon.get("/api/search?q=ab")).status()).toBe(401);
    expect((await admin.get("/api/search?q=a")).status()).toBe(400);
    expect((await admin.get("/api/search")).status()).toBe(400);
    expect((await admin.get(`/api/search?q=${"x".repeat(51)}`)).status()).toBe(400);
  });

  test("finds a customer by name or email, in any case", async ({ admin }) => {
    const customer = (await (await admin.get("/api/customers?pageSize=1")).json()).items[0];
    const byName = await (
      await admin.get(`/api/search?q=${encodeURIComponent(customer.name.split(" ")[0])}`)
    ).json();
    expect(byName.customers.find((hit: { id: string }) => hit.id === customer.id)).toEqual({
      id: customer.id,
      title: customer.name,
      subtitle: customer.email,
      href: `/customers/${customer.id}`,
    });
    const byEmail = await (
      await admin.get(`/api/search?q=${encodeURIComponent(customer.email.toUpperCase())}`)
    ).json();
    expect(byEmail.customers.some((hit: { id: string }) => hit.id === customer.id)).toBe(true);
  });

  test("finds an order by number and a product by SKU", async ({ admin }) => {
    const order = (await (await admin.get("/api/orders?pageSize=1")).json()).items[0];
    const orders = await (
      await admin.get(`/api/search?q=${encodeURIComponent(order.number)}`)
    ).json();
    expect(orders.orders.find((hit: { id: string }) => hit.id === order.id)).toMatchObject({
      href: `/orders/${order.id}`,
    });
    expect(orders.orders[0].subtitle).toContain("$");
    const product = (await (await admin.get("/api/products?pageSize=1")).json()).items[0];
    const products = await (
      await admin.get(`/api/search?q=${encodeURIComponent(product.sku)}`)
    ).json();
    expect(
      products.products.some(
        (hit: { id: string; subtitle: string }) =>
          hit.id === product.id && hit.subtitle.includes(product.sku)
      )
    ).toBe(true);
  });

  test("shows at most five of each kind, and nothing for a query that matches nothing", async ({
    admin,
  }) => {
    const body = await (await admin.get("/api/search?q=analytics.test")).json();
    expect(body.staff).toHaveLength(5);
    for (const group of Object.values(body))
      expect((group as unknown[]).length).toBeLessThanOrEqual(5);
    const none = await (await admin.get("/api/search?q=zzzzqqqq")).json();
    expect(Object.values(none).every((group) => (group as unknown[]).length === 0)).toBe(true);
  });

  test("leaves out what the role may not read", async ({ manager, support, admin }) => {
    expect(
      (await (await manager.get("/api/search?q=analytics.test")).json()).staff.length
    ).toBeGreaterThan(0);
    const body = await (await support.get("/api/search?q=analytics.test")).json();
    expect(body.staff).toHaveLength(0);
    expect(Array.isArray(body.customers)).toBe(true);
    const order = (await (await admin.get("/api/orders?pageSize=1")).json()).items[0];
    expect(
      (await (await support.get(`/api/search?q=${encodeURIComponent(order.number)}`)).json()).orders
    ).toHaveLength(1);
  });
});
