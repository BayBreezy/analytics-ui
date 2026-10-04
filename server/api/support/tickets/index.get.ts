// Newest first.
export default defineEventHandler(async (): Promise<Ticket[]> => {
  await delay();
  return [...getStore().tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});
