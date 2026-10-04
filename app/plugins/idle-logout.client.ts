/** Signs the user out after `public.idleTimeoutMs` without mouse, keyboard, scroll or touch activity. */
export default defineNuxtPlugin(() => {
  const { isLoggedIn, logout } = useAuth();
  const { idleTimeoutMs } = useRuntimeConfig().public;

  const { idle, lastActive, reset } = useIdle(idleTimeoutMs);

  // The session cookie is shared by every tab, so activity in one tab has to keep the others alive.
  // Each tab publishes its last activity here; `useLocalStorage` syncs it across tabs.
  const sharedLastActivity = useLocalStorage("auth:last-activity", Date.now());
  sharedLastActivity.value = Date.now();
  watch(lastActive, (value) => (sharedLastActivity.value = value));

  watch(idle, async (isIdle) => {
    if (!isIdle || !isLoggedIn.value) return;

    // Another tab was used recently, so the user isn't really idle. Start counting again.
    if (Date.now() - sharedLastActivity.value < idleTimeoutMs) return reset();

    await logout();
    useSonner("Signed out due to inactivity", {
      description: `You were signed out after ${formatDuration(idleTimeoutMs)} of inactivity.`,
    });
  });
});

function formatDuration(ms: number) {
  const minutes = Math.round(ms / 60_000);
  if (minutes >= 1) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const seconds = Math.max(1, Math.round(ms / 1000));
  return `${seconds} second${seconds === 1 ? "" : "s"}`;
}
