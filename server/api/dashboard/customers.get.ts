import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(6),
});

// The newest records in the store, so anything created on the customers pages shows up here.
export default defineEventHandler(async (event): Promise<Customer[]> => {
  const { limit } = validateQuery(event, querySchema);
  await delay();
  return listResource("customers", {
    page: 1,
    pageSize: limit,
    sort: "createdAt",
    order: "desc",
  }).items;
});
