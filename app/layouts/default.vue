<template>
  <UiSidebarProvider>
    <AppSidebar />
    <UiSidebarInset>
      <AppHeader />
      <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <slot />
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>

<script lang="ts" setup>
  useGlobalShortcuts();

  // Set by the route middleware when a role may not open a page.
  const accessDenied = useCookie<string | null>("access-denied", { maxAge: 30, sameSite: "lax" });
  onMounted(() =>
    watch(
      accessDenied,
      (denied) => {
        if (!denied) return;
        accessDenied.value = null;
        // The toaster is client-only and mounts a moment after the first render, so give it time.
        setTimeout(
          () =>
            useSonner.error("You don't have access to that page", {
              description: "Ask an admin if you need it.",
            }),
          150
        );
      },
      { immediate: true }
    )
  );

  // Page titles read "Orders · Store name". The name is a template param, so the title updates
  // when the settings load or change.
  const { settings } = useSettings();
  useHead(() => ({
    titleTemplate: "%s %separator %site",
    templateParams: { site: settings.value?.storeName ?? "Analytics", separator: "·" },
  }));
</script>
