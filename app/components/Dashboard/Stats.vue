<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <template v-if="error">
      <UiCard class="sm:col-span-2 xl:col-span-4">
        <AppErrorState what="stats" @retry="refresh()" />
      </UiCard>
    </template>
    <template v-else-if="!data">
      <UiCard v-for="n in 4" :key="n">
        <UiCardContent class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-3">
            <UiSkeleton class="h-4 w-24" />
            <UiSkeleton class="h-8 w-32" />
            <UiSkeleton class="h-4 w-40" />
          </div>
          <UiSkeleton class="size-11 rounded-lg" />
        </UiCardContent>
      </UiCard>
    </template>
    <template v-else>
      <DashboardStatCard v-for="stat in data" :key="stat.id" :stat="stat" />
    </template>
  </div>
</template>

<script lang="ts" setup>
  const { data, error, refresh } = useFetch<StatCard[]>("/api/dashboard/stats", {
    key: "dashboard-stats",
    server: false,
  });
</script>
