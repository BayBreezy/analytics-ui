// Signs out every device except the current one.
export default defineEventHandler(async (): Promise<AccountSession[]> => {
  await sleep(400);
  const store = getStore();
  store.sessions = store.sessions.filter((session) => session.current);
  return store.sessions;
});
