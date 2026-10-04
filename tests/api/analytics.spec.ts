import { expect, test } from "./fixtures";

/** Dates move with the clock, so compare the numbers only. */
const withoutDates = (value: unknown) =>
  JSON.stringify(value, (key, item) => (key === "date" ? undefined : item));

test.describe("overview", () => {
  for (const [range, length] of [
    ["7d", 7],
    ["30d", 30],
    ["12m", 12],
  ] as const) {
    test(`${range}: series, previous period and four KPIs`, async ({ admin }) => {
      const body = await (await admin.get(`/api/analytics/overview?range=${range}`)).json();
      expect(body.series).toHaveLength(length);
      expect(body.previous).toHaveLength(length);
      expect(body.kpis).toHaveLength(4);
      expect(new Date(body.previous.at(-1).date).getTime()).toBeLessThan(
        new Date(body.series[0].date).getTime()
      );
    });
  }

  test("breaks revenue down by category and ranks the top products", async ({ admin }) => {
    const body = await (await admin.get("/api/analytics/overview?range=30d")).json();
    expect(body.categories.length).toBeGreaterThan(0);
    expect(body.categories.every((item: { revenue: number }) => item.revenue > 0)).toBe(true);
    expect(body.topProducts).toHaveLength(5);
    const revenue = body.topProducts.map((item: { revenue: number }) => item.revenue);
    expect(revenue).toEqual([...revenue].sort((a, b) => b - a));
  });

  test("gives the same answer every time", async ({ admin }) => {
    const first = withoutDates(await (await admin.get("/api/analytics/overview?range=30d")).json());
    expect(withoutDates(await (await admin.get("/api/analytics/overview?range=30d")).json())).toBe(
      first
    );
  });

  test("rejects an unknown range", async ({ admin }) => {
    expect((await admin.get("/api/analytics/overview?range=bad")).status()).toBe(400);
  });
});

test.describe("statistics", () => {
  test("counts what is in the store", async ({ admin }) => {
    const stats = await (await admin.get("/api/analytics/statistics")).json();
    expect(
      stats.statuses.reduce((sum: number, item: { count: number }) => sum + item.count, 0)
    ).toBe(120);
    expect(stats.segments.none + stats.segments.once + stats.segments.repeat).toBe(48);
    expect(stats.stock.inStock + stats.stock.low + stats.stock.out).toBe(stats.stock.total);
  });

  test("category revenue adds up to the revenue of the orders", async ({ admin }) => {
    const stats = await (await admin.get("/api/analytics/statistics")).json();
    const orders: { status: string; items: { price: number; quantity: number }[] }[] = [];
    for (const page of [1, 2])
      orders.push(
        ...(await (await admin.get(`/api/orders?pageSize=100&page=${page}`)).json()).items
      );
    const counted = orders.filter(
      (order) => order.status !== "cancelled" && order.status !== "refunded"
    );
    const expected = counted.reduce(
      (sum, order) =>
        sum + order.items.reduce((inner, item) => inner + item.price * item.quantity, 0),
      0
    );
    const total = stats.categories.reduce(
      (sum: number, item: { revenue: number }) => sum + item.revenue,
      0
    );
    expect(Math.abs(total - expected)).toBeLessThan(0.5);
  });

  test("ranks the top customers and builds a weekday by hour heatmap", async ({ admin }) => {
    const stats = await (await admin.get("/api/analytics/statistics")).json();
    expect(stats.topCustomers).toHaveLength(10);
    const spent = stats.topCustomers.map((item: { spent: number }) => item.spent);
    expect(spent).toEqual([...spent].sort((a, b) => b - a));
    expect(stats.heatmap).toHaveLength(7);
    expect(stats.heatmap.every((day: { slots: unknown[] }) => day.slots.length === 8)).toBe(true);
  });

  test("follows the store when something changes", async ({ admin }) => {
    const before = await (await admin.get("/api/analytics/statistics")).json();
    const order = (await (await admin.get("/api/orders?pageSize=1")).json()).items[0];
    await admin.put(`/api/orders/${order.id}`, { data: { status: "cancelled" } });
    const after = await (await admin.get("/api/analytics/statistics")).json();
    expect(withoutDates(after.statuses)).not.toBe(withoutDates(before.statuses));
  });
});

test.describe("trends", () => {
  test("compares with the previous period when asked", async ({ admin }) => {
    const body = await (
      await admin.get("/api/analytics/trends?metric=revenue&range=30d&compare=true")
    ).json();
    expect(body.points).toHaveLength(30);
    expect(
      body.points.every((point: { previous: unknown }) => typeof point.previous === "number")
    ).toBe(true);
    expect(body.growth).toHaveLength(29);
    expect(body.summary.best.value).toBeGreaterThanOrEqual(body.summary.worst.value);
  });

  test("leaves the previous period out otherwise", async ({ admin }) => {
    const body = await (await admin.get("/api/analytics/trends?metric=orders&range=7d")).json();
    expect(body.points.every((point: { previous?: number }) => point.previous === undefined)).toBe(
      true
    );
  });

  test("supports every metric", async ({ admin }) => {
    for (const metric of ["revenue", "orders", "customers", "averageOrder"]) {
      expect(
        (await admin.get(`/api/analytics/trends?metric=${metric}&range=12m`)).status(),
        metric
      ).toBe(200);
    }
    expect((await admin.get("/api/analytics/trends?metric=bad")).status()).toBe(400);
  });
});

test.describe("dashboard", () => {
  test("the sales series keeps its shape and its seeded total", async ({ admin }) => {
    expect((await (await admin.get("/api/dashboard/sales?range=7d")).json()).points).toHaveLength(
      7
    );
    expect((await (await admin.get("/api/dashboard/sales?range=30d")).json()).totals.revenue).toBe(
      80426
    );
  });

  test("lists the newest orders, products and customers from the store", async ({ admin }) => {
    const orders = await (await admin.get("/api/dashboard/orders")).json();
    expect(orders[0].number).toBe("#ORD-4821");
    const created = await (
      await admin.post("/api/customers", {
        data: {
          name: "Zed Test",
          email: "zed@test.dev",
          phone: "555-123-4567",
          city: "Austin",
          country: "USA",
          status: "active",
        },
      })
    ).json();
    const customers = await (await admin.get("/api/dashboard/customers")).json();
    expect(customers.map((item: { id: string }) => item.id)).toContain(created.id);
  });
});
