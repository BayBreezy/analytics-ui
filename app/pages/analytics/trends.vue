<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Trends</h1>
        <p class="mt-1 text-sm text-muted-foreground">How your numbers change over time.</p>
      </div>
      <AnalyticsRangeTabs v-model="range" />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <UiTabs v-model="metric">
        <UiTabsList>
          <UiTabsTrigger v-for="option in METRIC_OPTIONS" :key="option.value" :value="option.value">
            {{ option.short }}
          </UiTabsTrigger>
        </UiTabsList>
      </UiTabs>
      <div class="flex items-center gap-2">
        <UiSwitch id="compare" v-model="compare" />
        <UiLabel for="compare" class="cursor-pointer">Compare to previous period</UiLabel>
      </div>
    </div>

    <AnalyticsTrendSummary :trends="data" />

    <div class="grid gap-6 *:min-w-0">
      <AnalyticsTrendChart
        :trends="data"
        :refreshing="pending && !!data"
        :error="failed"
        @retry="refresh()"
      />
      <AnalyticsGrowthChart
        :trends="data"
        :refreshing="pending && !!data"
        :error="failed"
        @retry="refresh()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  definePageMeta({ permission: "analytics:read" });
  useSeoMeta({ title: "Trends" });

  const range = useQueryParam<SalesRange>("range", "30d", ["7d", "30d", "12m"]);
  const metric = useQueryParam<AnalyticsMetric>(
    "metric",
    "revenue",
    METRIC_OPTIONS.map((option) => option.value)
  );
  const compareParam = useQueryParam<"1" | "0">("compare", "0", ["1", "0"]);
  const compare = computed({
    get: () => compareParam.value === "1",
    set: (value: boolean) => (compareParam.value = value ? "1" : "0"),
  });

  const { data, pending, error, refresh } = useFetch<AnalyticsTrends>("/api/analytics/trends", {
    key: "analytics-trends",
    query: { metric, range, compare: computed(() => (compare.value ? "1" : "0")) },
    server: false,
  });
  const failed = computed(() => (error.value && !data.value ? error.value : undefined));
</script>
