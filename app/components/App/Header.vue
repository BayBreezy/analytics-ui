<template>
  <UiNavbar sticky class="flex h-14 shrink-0 items-center gap-2 px-4 md:rounded-t-xl">
    <UiSidebarTrigger class="-ml-1" />
    <UiDivider orientation="vertical" class="mr-2 h-4 w-px" />
    <UiBreadcrumbs :items="breadcrumbs" />
    <div class="ml-auto flex items-center gap-1">
      <UiButton
        variant="outline"
        size="sm"
        class="gap-2 text-muted-foreground max-sm:hidden"
        aria-label="Search and run commands"
        @click="palette = true"
      >
        <Icon name="lucide:search" />
        Search
        <UiKbd v-if="mounted" class="ml-2">{{ isMac ? "⌘K" : "Ctrl K" }}</UiKbd>
      </UiButton>
      <UiButton
        variant="ghost"
        size="icon"
        class="sm:hidden"
        aria-label="Search and run commands"
        @click="palette = true"
      >
        <Icon name="lucide:search" />
      </UiButton>
      <AppNotificationsMenu />
      <ColorModeToggle />
    </div>
  </UiNavbar>
</template>

<script lang="ts" setup>
  const route = useRoute();
  const breadcrumbs = computed(() => getBreadcrumbs(route.path));

  const palette = useCommandPalette();
  // The platform is only known in the browser, so the shortcut hint appears after mounting.
  const mounted = useMounted();
  const isMac = computed(() => mounted.value && /Mac|iPhone|iPad/.test(navigator.platform));
</script>
