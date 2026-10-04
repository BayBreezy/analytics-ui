export default defineEventHandler(async (event): Promise<Settings> => {
  const input = await validateBody(event, settingsSchema);
  await sleep(400);
  return (getStore().settings = input);
});
