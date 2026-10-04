/** Mock sales series shared by the sales chart and the stat cards. */
const RANGES = {
  "7d": { count: 7, seed: 71 },
  "30d": { count: 30, seed: 301 },
  "12m": { count: 12, seed: 121 },
} as const;

/** Daily points for 7d/30d, monthly points for 12m. The last point is today / this month. */
export function buildSales(range: SalesRange): SalesResponse {
  const { count, seed } = RANGES[range];
  const faker = createMock(seed);
  const monthly = range === "12m";
  const now = new Date();

  const points: SalesPoint[] = Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
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

    return { date: date.toISOString(), revenue, orders };
  });

  return {
    range,
    points,
    totals: {
      revenue: points.reduce((sum, point) => sum + point.revenue, 0),
      orders: points.reduce((sum, point) => sum + point.orders, 0),
    },
  };
}
