import { z } from "zod";

const querySchema = z.object({
  range: z.enum(["7d", "30d", "12m"]).default("30d"),
});

export default defineEventHandler(async (event): Promise<SalesResponse> => {
  const { range } = validateQuery(event, querySchema);
  await delay();
  return buildSales(range);
});
