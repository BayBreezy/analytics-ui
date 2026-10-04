const RANGE_DAYS = { "7d": 7, "30d": 30, "12m": 365 } as const;

const round = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const percentChange = (current: number, previous: number) =>
  previous === 0 ? 0 : round(((current - previous) / previous) * 100, 1);

/** Orders that count as sales: not cancelled or refunded. */
export function salesOrders(range?: SalesRange) {
  const since = range ? Date.now() - RANGE_DAYS[range] * 86_400_000 : 0;
  return getStore().orders.filter(
    (order) =>
      order.status !== "cancelled" &&
      order.status !== "refunded" &&
      new Date(order.createdAt).getTime() >= since
  );
}

/** Revenue and order count per product category, biggest first. */
export function categoryStats(orders: Order[]): CategoryStat[] {
  const categoryOf = new Map(getStore().products.map((product) => [product.id, product.category]));
  const stats = new Map<string, CategoryStat>();
  for (const order of orders) {
    const seen = new Set<string>();
    for (const item of order.items) {
      const category = categoryOf.get(item.productId) ?? "Other";
      const entry = stats.get(category) ?? { category, revenue: 0, orders: 0 };
      entry.revenue = round(entry.revenue + item.price * item.quantity);
      if (!seen.has(category)) {
        entry.orders += 1;
        seen.add(category);
      }
      stats.set(category, entry);
    }
  }
  return [...stats.values()].sort((a, b) => b.revenue - a.revenue);
}

export function topProducts(orders: Order[], limit = 5): TopProduct[] {
  const stats = new Map<string, TopProduct>();
  for (const order of orders) {
    for (const item of order.items) {
      const entry = stats.get(item.productId) ?? {
        id: item.productId,
        name: item.name,
        revenue: 0,
        units: 0,
      };
      entry.revenue = round(entry.revenue + item.price * item.quantity);
      entry.units += item.quantity;
      stats.set(item.productId, entry);
    }
  }
  return [...stats.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function topCustomers(orders: Order[], limit = 10): TopCustomer[] {
  const stats = new Map<string, TopCustomer>();
  for (const order of orders) {
    const entry = stats.get(order.customer.id) ?? {
      ...order.customer,
      orders: 0,
      spent: 0,
    };
    entry.orders += 1;
    entry.spent = round(entry.spent + order.total);
    stats.set(order.customer.id, entry);
  }
  return [...stats.values()].sort((a, b) => b.spent - a.spent).slice(0, limit);
}

/** Customers by how many sales they have: none, one, or two and more. */
export function customerSegments(orders: Order[]) {
  const counts = new Map<string, number>();
  for (const order of orders)
    counts.set(order.customer.id, (counts.get(order.customer.id) ?? 0) + 1);
  const customers = getStore().customers;
  let none = 0;
  let once = 0;
  let repeat = 0;
  for (const customer of customers) {
    const count = counts.get(customer.id) ?? 0;
    if (count === 0) none += 1;
    else if (count === 1) once += 1;
    else repeat += 1;
  }
  return { none, once, repeat };
}

export function stockHealth() {
  const active = getStore().products.filter((product) => product.status === "active");
  return {
    inStock: active.filter((product) => product.stock >= 20).length,
    low: active.filter((product) => product.stock > 0 && product.stock < 20).length,
    out: active.filter((product) => product.stock === 0).length,
    total: active.length,
  };
}

export function statusStats() {
  const stats = new Map<OrderStatus, { status: OrderStatus; count: number; revenue: number }>();
  for (const order of getStore().orders) {
    const entry = stats.get(order.status) ?? { status: order.status, count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue = round(entry.revenue + order.total);
    stats.set(order.status, entry);
  }
  return ORDER_STATUSES.map((status) => stats.get(status) ?? { status, count: 0, revenue: 0 });
}

/** Seeded orders-by-weekday-and-time-slot counts, busier at lunch and in the evening. */
export function buildHeatmap() {
  const faker = createMock(909);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // Eight three-hour slots from midnight: 12a, 3a, 6a, 9a, 12p, 3p, 6p, 9p.
  const shape = [0.1, 0.05, 0.25, 0.7, 1, 0.8, 0.95, 0.5];
  return days.map((day, index) => {
    const weekend = index >= 5 ? 1.2 : 1;
    return {
      day,
      slots: shape.map((weight) =>
        Math.round(weight * weekend * faker.number.int({ min: 8, max: 26 }))
      ),
    };
  });
}

/** A moving average over `window` points, using fewer points at the start. */
export function movingAverage(values: number[], window: number) {
  return values.map((_, index) => {
    const slice = values.slice(Math.max(0, index - window + 1), index + 1);
    return round(sum(slice) / slice.length);
  });
}

/** The value of a metric for a group of points (an average order is revenue divided by orders). */
export function metricTotal(points: SeriesPoint[], metric: AnalyticsMetric) {
  if (metric === "averageOrder")
    return round(sum(points.map((p) => p.revenue)) / sum(points.map((p) => p.orders)));
  return sum(points.map((point) => point[metric]));
}

export { percentChange, round, sum };
