/** Mock sales series shared by the dashboard and the analytics pages. */
const RANGES = {
  "7d": { count: 7, seed: 71 },
  "30d": { count: 30, seed: 301 },
  "12m": { count: 12, seed: 121 },
} as const;

/**
 * Daily points for 7d/30d, monthly points for 12m. The last point is today / this month. With
 * `previous` it builds the period just before that one (same length), for comparisons.
 */
export function buildSeries(range: SalesRange, previous = false): SeriesPoint[] {
  const { count, seed } = RANGES[range];
  const faker = createMock(previous ? seed + 5000 : seed);
  // Customers come from their own generator so adding them doesn't change the orders and revenue.
  const customerFaker = createMock((previous ? seed + 5000 : seed) + 777);
  const monthly = range === "12m";
  const now = new Date();
  const shift = previous ? count : 0;

  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index + shift;
    const date = monthly
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1))
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));

    // A gentle upward trend with noise, and busier weekends for the daily ranges.
    const growth = 1 + (index / count) * 0.35;
    const weekend = !monthly && [0, 6].includes(date.getUTCDay()) ? 1.25 : 1;
    const orders = Math.round(
      (monthly
        ? faker.number.int({ min: 520, max: 760 })
        : faker.number.int({ min: 14, max: 30 })) *
        growth *
        weekend
    );
    const revenue = Math.round(orders * faker.number.float({ min: 68, max: 112 }));
    const customers = Math.round(orders * customerFaker.number.float({ min: 0.25, max: 0.45 }));

    return {
      date: date.toISOString(),
      revenue,
      orders,
      customers,
      averageOrder: Math.round((revenue / orders) * 100) / 100,
    };
  });
}

export function buildSales(range: SalesRange): SalesResponse {
  const points: SalesPoint[] = buildSeries(range).map(({ date, revenue, orders }) => ({
    date,
    revenue,
    orders,
  }));

  return {
    range,
    points,
    totals: {
      revenue: points.reduce((sum, point) => sum + point.revenue, 0),
      orders: points.reduce((sum, point) => sum + point.orders, 0),
    },
  };
}
