import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(6),
});

export default defineEventHandler(async (event): Promise<Order[]> => {
  const { limit } = validateQuery(event, querySchema);
  await delay();
  const faker = createMock(21);

  return Array.from({ length: limit }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      id: `#ORD-${4821 - index}`,
      customer: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        avatar: faker.image.avatar(),
      },
      product: faker.commerce.productName(),
      amount: Number(faker.commerce.price({ min: 18, max: 420 })),
      status: faker.helpers.weightedArrayElement<OrderStatus>([
        { weight: 5, value: "paid" },
        { weight: 3, value: "shipped" },
        { weight: 3, value: "pending" },
        { weight: 1, value: "refunded" },
        { weight: 1, value: "cancelled" },
      ]),
      // A new order every hour or so, newest first.
      createdAt: hoursAgo(index * 1.4 + faker.number.float({ min: 0.1, max: 1 })),
    };
  });
});
