export default defineEventHandler(async (): Promise<Settings> => {
  await delay();
  return getStore().settings;
});
