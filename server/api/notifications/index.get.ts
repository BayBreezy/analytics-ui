// The newest notifications for the signed-in user's role, with how many are unread.
export default defineEventHandler(async (event): Promise<NotificationsResponse> => {
  const user = getSessionUser(event);
  const items = notificationsFor(user?.role);
  return { items: items.slice(0, 30), unread: items.filter((item) => !item.read).length };
});
