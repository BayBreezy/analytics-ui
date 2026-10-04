export default defineEventHandler(async (): Promise<AccountSession[]> => {
  await delay();
  return getStore().sessions;
});
