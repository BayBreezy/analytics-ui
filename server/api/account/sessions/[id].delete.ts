export default defineEventHandler(async (event): Promise<AccountSession[]> => {
  const id = getRouterParam(event, "id");
  await sleep(300);

  const store = getStore();
  const session = store.sessions.find((entry) => entry.id === id);
  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No session with id "${id}"`,
    });
  }
  if (session.current) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "This is the device you are using. Log out from the menu instead.",
    });
  }

  store.sessions = store.sessions.filter((entry) => entry.id !== id);
  return store.sessions;
});
