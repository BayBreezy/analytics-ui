import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export default defineEventHandler(async (event): Promise<Product[]> => {
  const { limit } = validateQuery(event, querySchema);
  await delay();
  const faker = createMock(31);

  return Array.from({ length: limit }, (_, index) => ({
    id: `prod-${300 - index}`,
    name: faker.commerce.productName(),
    category: faker.helpers.arrayElement(PRODUCT_CATEGORIES),
    price: Number(faker.commerce.price({ min: 9, max: 380 })),
    stock: faker.number.int({ min: 0, max: 240 }),
    createdAt: daysAgo(index * 1.3 + faker.number.float({ min: 0.1, max: 1 })),
  }));
});
