export default defineEventHandler(async (event): Promise<AppNotification> => {
  const id = getRouterParam(event, "id");
  const user = getSessionUser(event);
  const item = notificationsFor(user?.role).find((entry) => entry.id === id);
  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No notification with id "${id}"`,
    });
  }
  item.read = true;
  return item;
});
