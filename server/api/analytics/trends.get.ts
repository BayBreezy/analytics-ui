import { z } from "zod";

const querySchema = z.object({
  metric: z.enum(["revenue", "orders", "customers", "averageOrder"]).default("revenue"),
  range: z.enum(["7d", "30d", "12m"]).default("30d"),
  compare: z
    .enum(["true", "false", "1", "0"])
    .default("false")
    .transform((value) => value === "true" || value === "1"),
});

export default defineEventHandler(async (event): Promise<AnalyticsTrends> => {
  const { metric, range, compare } = validateQuery(event, querySchema);
  await delay();

  const series = buildSeries(range);
  const previous = buildSeries(range, true);
  const values = series.map((point) => point[metric]);
  const average = movingAverage(values, range === "12m" ? 3 : 7);

  const points: TrendPoint[] = series.map((point, index) => ({
    date: point.date,
    value: point[metric],
    average: average[index]!,
    ...(compare && { previous: previous[index]![metric] }),
  }));

  const total = metricTotal(series, metric);
  const previousTotal = metricTotal(previous, metric);
  const sorted = [...series].sort((a, b) => b[metric] - a[metric]);
  const best = sorted[0]!;
  const worst = sorted[sorted.length - 1]!;

  return {
    metric,
    range,
    compare,
    points,
    summary: {
      total,
      previousTotal,
      changePercent: percentChange(total, previousTotal),
      averagePerPeriod: round(sum(values) / values.length),
      best: { date: best.date, value: best[metric] },
      worst: { date: worst.date, value: worst[metric] },
    },
    growth: series.slice(1).map((point, index) => ({
      date: point.date,
      change: percentChange(point[metric], series[index]![metric]),
    })),
  };
});
