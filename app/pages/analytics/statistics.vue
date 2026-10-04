<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Statistics</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Breakdowns of your orders, customers and stock.
      </p>
    </div>

    <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
      <div class="*:h-full lg:col-span-2">
        <AnalyticsCategoryBars :categories="data?.categories" :error="failed" @retry="refresh()" />
      </div>
      <AnalyticsStatusDonut :statuses="data?.statuses" :error="failed" @retry="refresh()" />
    </div>

    <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
      <div class="*:h-full lg:col-span-2">
        <AnalyticsOrdersHeatmap :heatmap="data?.heatmap" :error="failed" @retry="refresh()" />
      </div>
      <AnalyticsSegmentsDonut :segments="data?.segments" :error="failed" @retry="refresh()" />
    </div>

    <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
      <div class="*:h-full lg:col-span-2">
        <AnalyticsTopCustomers :customers="data?.topCustomers" :error="failed" @retry="refresh()" />
      </div>
      <AnalyticsStockHealth :stock="data?.stock" :error="failed" @retry="refresh()" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Statistics" });

  const { data, error, refresh } = useFetch<AnalyticsStatistics>("/api/analytics/statistics", {
    key: "analytics-statistics",
    server: false,
  });
  const failed = computed(() => (error.value && !data.value ? error.value : undefined));
</script>
