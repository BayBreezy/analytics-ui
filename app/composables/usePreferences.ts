const YEAR = 60 * 60 * 24 * 365;

/** Idle timeouts to choose from. 0 means "never sign me out". */
export const IDLE_TIMEOUTS = [
  { value: 60_000, label: "1 minute" },
  { value: 5 * 60_000, label: "5 minutes" },
  { value: 15 * 60_000, label: "15 minutes" },
  { value: 30 * 60_000, label: "30 minutes" },
  { value: 0, label: "Never" },
] as const;

/**
 * Settings for this browser, kept in cookies so they are available during SSR. Unlike the store
 * settings, they aren't shared with anyone else and don't reset when the server restarts.
 */
export function usePreferences() {
  const options = { sameSite: "lax", maxAge: YEAR } as const;
  const idleCookie = useCookie<number | undefined>("pref-idle-timeout", options);
  const pageSizeCookie = useCookie<number | undefined>("pref-page-size", options);
  const { idleTimeoutMs: defaultIdleTimeout } = useRuntimeConfig().public;

  /** How long without activity signs the user out, in ms. 0 disables it. */
  const idleTimeoutMs = computed({
    get: () =>
      IDLE_TIMEOUTS.some((option) => option.value === idleCookie.value)
        ? idleCookie.value!
        : defaultIdleTimeout,
    set: (value) => (idleCookie.value = value),
  });

  /** How many rows lists show per page unless the URL says otherwise. */
  const pageSize = computed({
    get: () =>
      PAGE_SIZES.includes(pageSizeCookie.value!) ? pageSizeCookie.value! : PAGE_SIZES[0]!,
    set: (value) => (pageSizeCookie.value = value),
  });

  return { idleTimeoutMs, pageSize };
}
