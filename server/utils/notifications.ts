const MAX_NOTIFICATIONS = 50;

/**
 * Adds a notification for something that just happened in the store. It is skipped when the
 * in-app switch for that kind of event is off in Settings → Notifications.
 */
export function notify(
  type: AppNotification["type"],
  content: Pick<AppNotification, "title" | "body" | "href">
) {
  const store = getStore();
  if (!store.settings.notifications[type].inApp) return;

  store.notifications.unshift({
    id: `ntf_${nextNotificationNumber()}`,
    type,
    read: false,
    createdAt: new Date().toISOString(),
    ...content,
  });
  store.notifications.length = Math.min(store.notifications.length, MAX_NOTIFICATIONS);
}

/** Products with fewer than this many left count as low on stock (see `ProductsStockBadge`). */
export const LOW_STOCK_BELOW = 20;

/** The notifications a role gets to see. Team news is only for people who manage the team. */
export const notificationsFor = (role: unknown) =>
  getStore().notifications.filter(
    (item) => item.type !== "teamInvites" || hasPermission(role, "team:manage")
  );
