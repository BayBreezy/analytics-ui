// A partial update, so ticking a reminder off only sends `{ done }`.
export default defineEventHandler(async (event): Promise<Reminder> => {
  const reminder = findReminder(getRouterParam(event, "id"));
  const patch = await validateBody(event, reminderSchema.partial());
  await sleep(250);
  return Object.assign(reminder, patch);
});
