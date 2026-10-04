export default defineEventHandler(async (event): Promise<OkResponse> => {
  const reminder = findReminder(getRouterParam(event, "id"));
  await sleep(250);
  const reminders = getStore().reminders;
  reminders.splice(reminders.indexOf(reminder), 1);
  return { ok: true, message: "Reminder deleted" };
});
