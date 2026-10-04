/**
 * The store settings, shared by everything that shows or edits them. They are fetched once under
 * a fixed key, so the Settings page and the sidebar read the same data.
 */
export function useSettings() {
  const {
    data: settings,
    error,
    refresh,
  } = useFetch<Settings>("/api/settings", { key: "settings", server: false });

  /** Saves a change to some of the settings and returns the saved result. */
  async function save(patch: Partial<Settings>) {
    if (!settings.value) throw new Error("The settings haven't loaded yet");
    const saved = await $fetch<Settings>("/api/settings", {
      method: "PUT",
      body: { ...settings.value, ...patch },
    });
    settings.value = saved;
    return saved;
  }

  return { settings, error, refresh, save };
}
