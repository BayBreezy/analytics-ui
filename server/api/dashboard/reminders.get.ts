export default defineEventHandler(async (): Promise<Reminder[]> => {
  await delay();
  const faker = createMock(61);

  return [
    { title: "Review pending refunds", time: "9:30 AM", done: true },
    { title: `Call ${faker.person.fullName()} about a bulk order`, time: "11:00 AM", done: false },
    { title: "Restock low inventory items", time: "1:00 PM", done: false },
    { title: "Team sync: weekly sales review", time: "2:30 PM", done: false },
    { title: `Send the promo email to new customers`, time: "4:00 PM", done: false },
  ].map((reminder, index) => ({ id: `rem-${index}`, ...reminder }));
});
