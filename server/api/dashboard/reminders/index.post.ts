// New reminders go to the end of the list.
export default defineEventHandler(async (event): Promise<Reminder> => {
  const input = await validateBody(event, reminderSchema);
  await sleep(250);
  const reminder: Reminder = { id: `rem_${nextReminderNumber()}`, ...input };
  getStore().reminders.push(reminder);
  setResponseStatus(event, 201);
  return reminder;
});
