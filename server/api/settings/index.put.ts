export default defineEventHandler(async (event): Promise<Settings> => {
  requirePermission(event, "settings:manage");
  const input = await validateBody(event, settingsSchema);
  await sleep(400);
  return (getStore().settings = input);
});
