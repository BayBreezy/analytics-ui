import type { EffectScope } from "vue";

/**
 * Signs the user out after the idle timeout (a preference, 5 minutes by default) without mouse,
 * keyboard, scroll or touch activity. A timeout of 0 turns it off.
 */
export default defineNuxtPlugin(() => {
  const { isLoggedIn, logout } = useAuth();
  const { idleTimeoutMs } = usePreferences();

  // The session cookie is shared by every tab, so activity in one tab has to keep the others alive.
  // Each tab publishes its last activity here; `useLocalStorage` syncs it across tabs.
  const sharedLastActivity = useLocalStorage("auth:last-activity", Date.now());
  sharedLastActivity.value = Date.now();

  // `useIdle` reads its timeout once, so a new one is created whenever the preference changes.
  let scope: EffectScope | undefined;
  watch(
    idleTimeoutMs,
    (timeout) => {
      scope?.stop();
      scope = undefined;
      if (!timeout) return;

      scope = effectScope();
      scope.run(() => {
        const { idle, lastActive, reset } = useIdle(timeout);
        watch(lastActive, (value) => (sharedLastActivity.value = value));

        watch(idle, async (isIdle) => {
          if (!isIdle || !isLoggedIn.value) return;

          // Another tab was used recently, so the user isn't really idle. Start counting again.
          if (Date.now() - sharedLastActivity.value < timeout) return reset();

          await logout();
          useSonner("Signed out due to inactivity", {
            description: `You were signed out after ${formatDuration(timeout)} of inactivity.`,
          });
        });
      });
    },
    { immediate: true }
  );
});

function formatDuration(ms: number) {
  const minutes = Math.round(ms / 60_000);
  if (minutes >= 1) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const seconds = Math.max(1, Math.round(ms / 1000));
  return `${seconds} second${seconds === 1 ? "" : "s"}`;
}
