<template>
  <div class="flex flex-1 items-center justify-center py-10">
    <UiEmpty class="max-w-md">
      <UiEmptyHeader>
        <UiEmptyMedia variant="icon">
          <Icon name="lucide:construction" />
        </UiEmptyMedia>
        <UiEmptyTitle>{{ title }}</UiEmptyTitle>
        <UiEmptyDescription>
          This page is coming soon. The dashboard is the only finished page for now.
        </UiEmptyDescription>
      </UiEmptyHeader>
      <UiEmptyContent>
        <UiButton :to="DASHBOARD_URL">
          <Icon name="lucide:arrow-left" />
          Back to dashboard
        </UiButton>
      </UiEmptyContent>
    </UiEmpty>
  </div>
</template>

<script lang="ts" setup>
  // One page component serves every placeholder route. Routes are registered from the navigation
  // config by the `pages:extend` hook in nuxt.config.ts.
  const route = useRoute();
  const title = computed(() => getPageTitle(route.path));

  useSeoMeta({ title: () => title.value });
</script>
