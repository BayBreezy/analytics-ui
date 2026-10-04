import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(6),
});

export default defineEventHandler(async (event): Promise<Customer[]> => {
  const { limit } = validateQuery(event, querySchema);
  await delay();
  const faker = createMock(41);

  return Array.from({ length: limit }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      id: `cust-${900 - index}`,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      avatar: faker.image.avatar(),
      joinedAt: hoursAgo(index * 7 + faker.number.float({ min: 0.5, max: 6 })),
    };
  });
});
