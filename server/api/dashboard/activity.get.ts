export default defineEventHandler(async (): Promise<Activity[]> => {
  await delay();
  const faker = createMock(51);
  const orderNumber = () => `#ORD-${faker.number.int({ min: 4700, max: 4821 })}`;

  const templates: Record<ActivityType, () => Pick<Activity, "title" | "description">> = {
    order: () => ({
      title: "New order placed",
      description: `${faker.person.fullName()} ordered ${faker.commerce.productName()} (${orderNumber()})`,
    }),
    customer: () => ({
      title: "New customer",
      description: `${faker.person.fullName()} created an account`,
    }),
    review: () => ({
      title: "New review",
      description: `${faker.person.firstName()} rated ${faker.commerce.productName()} ${faker.number.int({ min: 3, max: 5 })} stars`,
    }),
    refund: () => ({
      title: "Refund issued",
      description: `${orderNumber()} was refunded to ${faker.person.fullName()}`,
    }),
    stock: () => ({
      title: "Low stock",
      description: `${faker.commerce.productName()} has ${faker.number.int({ min: 2, max: 9 })} units left`,
    }),
  };

  const types = Object.keys(templates) as ActivityType[];
  return Array.from({ length: 8 }, (_, index) => {
    const type = faker.helpers.arrayElement(types);
    return {
      id: `act-${index}`,
      type,
      ...templates[type](),
      createdAt: hoursAgo(index * 1.6 + faker.number.float({ min: 0.1, max: 1 })),
    };
  });
});
