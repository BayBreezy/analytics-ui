<template>
  <UiNavbar sticky class="flex h-14 shrink-0 items-center gap-2 px-4 md:rounded-t-xl">
    <UiSidebarTrigger class="-ml-1" />
    <UiDivider orientation="vertical" class="mr-2 h-4 w-px" />
    <UiBreadcrumbs :items="breadcrumbs" />
    <div class="ml-auto flex items-center gap-1">
      <AppNotificationsMenu />
      <ColorModeToggle />
    </div>
  </UiNavbar>
</template>

<script lang="ts" setup>
  const route = useRoute();
  const breadcrumbs = computed(() => getBreadcrumbs(route.path));
</script>
