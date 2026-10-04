import { z } from "zod";

const querySchema = z.object({
  range: z.enum(["7d", "30d", "12m"]).default("30d"),
});

export default defineEventHandler(async (event): Promise<AnalyticsOverview> => {
  const { range } = validateQuery(event, querySchema);
  await delay();

  const series = buildSeries(range);
  const previous = buildSeries(range, true);
  const faker = createMock(range.length + 5);
  const orders = salesOrders(range);
  const segments = customerSegments(salesOrders());
  const buyers = segments.once + segments.repeat;
  const repeatRate = buyers ? round((segments.repeat / buyers) * 100, 1) : 0;
  const conversion = round(faker.number.float({ min: 2.6, max: 4.1 }), 1);

  const revenue = metricTotal(series, "revenue");
  const averageOrder = metricTotal(series, "averageOrder");
  const caption = "vs previous period";
  const card = (
    id: string,
    label: string,
    value: number,
    format: StatCard["format"],
    changePercent: number
  ): StatCard => ({
    id,
    label,
    value,
    format,
    changePercent,
    trend: changePercent >= 0 ? "up" : "down",
    caption,
  });

  return {
    range,
    kpis: [
      card(
        "revenue",
        "Revenue",
        revenue,
        "currency",
        percentChange(revenue, metricTotal(previous, "revenue"))
      ),
      card(
        "averageOrder",
        "Average order value",
        averageOrder,
        "currency",
        percentChange(averageOrder, metricTotal(previous, "averageOrder"))
      ),
      card(
        "conversion",
        "Conversion rate",
        conversion,
        "percent",
        round(faker.number.float({ min: -0.8, max: 1.6 }), 1)
      ),
      card(
        "repeat",
        "Repeat customers",
        repeatRate,
        "percent",
        round(faker.number.float({ min: -1.5, max: 2.4 }), 1)
      ),
    ],
    series,
    previous,
    categories: categoryStats(orders),
    topProducts: topProducts(orders),
  };
});
