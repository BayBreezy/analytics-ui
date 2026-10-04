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
  // Page titles read "Orders · Store name". The name is a template param, so the title updates
  // when the settings load or change.
  useGlobalShortcuts();
  const { settings } = useSettings();
  useHead(() => ({
    titleTemplate: "%s %separator %site",
    templateParams: { site: settings.value?.storeName ?? "Analytics", separator: "·" },
  }));
</script>
