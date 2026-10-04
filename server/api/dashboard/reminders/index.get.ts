export default defineEventHandler(async (): Promise<Reminder[]> => {
  await delay();
  return getStore().reminders;
});
