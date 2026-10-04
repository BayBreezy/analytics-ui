import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

// The newest records in the store, so anything created on the products pages shows up here.
export default defineEventHandler(async (event): Promise<Product[]> => {
  const { limit } = validateQuery(event, querySchema);
  await delay();
  return listResource("products", {
    page: 1,
    pageSize: limit,
    sort: "createdAt",
    order: "desc",
  }).items;
});
