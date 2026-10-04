export default defineEventHandler(async (): Promise<StatCard[]> => {
  await delay();
  const faker = createMock(11);
  const { totals } = buildSales("30d");

  const change = (min: number, max: number) => faker.number.float({ min, max, fractionDigits: 1 });
  const card = (
    stat: Omit<StatCard, "trend" | "caption" | "changePercent">,
    changePercent: number
  ): StatCard => ({
    ...stat,
    changePercent,
    trend: changePercent >= 0 ? "up" : "down",
    caption: "vs previous 30 days",
  });

  return [
    card(
      { id: "revenue", label: "Total revenue", value: totals.revenue, format: "currency" },
      change(8, 24)
    ),
    card({ id: "orders", label: "Orders", value: totals.orders, format: "number" }, change(3, 16)),
    card(
      {
        id: "customers",
        label: "New customers",
        value: faker.number.int({ min: 280, max: 420 }),
        format: "number",
      },
      change(-9, 12)
    ),
    card(
      {
        id: "averageOrder",
        label: "Average order value",
        value: Math.round((totals.revenue / totals.orders) * 100) / 100,
        format: "currency",
      },
      change(-6, 7)
    ),
  ];
});
