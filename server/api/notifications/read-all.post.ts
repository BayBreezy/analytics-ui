export default defineEventHandler(async (event): Promise<NotificationsResponse> => {
  const user = getSessionUser(event);
  for (const item of notificationsFor(user?.role)) item.read = true;
  const items = notificationsFor(user?.role);
  return { items: items.slice(0, 30), unread: 0 };
});
