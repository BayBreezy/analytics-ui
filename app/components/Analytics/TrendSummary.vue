<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <template v-if="!trends">
      <UiCard v-for="n in 4" :key="n">
        <UiCardContent class="space-y-3">
          <UiSkeleton class="h-4 w-24" />
          <UiSkeleton class="h-8 w-32" />
          <UiSkeleton class="h-4 w-36" />
        </UiCardContent>
      </UiCard>
    </template>
    <template v-else>
      <UiCard v-for="tile in tiles" :key="tile.label">
        <UiCardContent>
          <p class="text-sm font-medium text-muted-foreground">{{ tile.label }}</p>
          <p class="mt-2 text-2xl font-bold tracking-tight">{{ tile.value }}</p>
          <p v-if="tile.change !== undefined" class="mt-2 flex items-center gap-1.5 text-sm">
            <span
              class="flex items-center gap-1 font-medium"
              :class="
                tile.change >= 0
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-red-600 dark:text-red-500'
              "
            >
              <Icon :name="tile.change >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'" />
              {{ tile.change > 0 ? "+" : "" }}{{ tile.change }}%
            </span>
            <span class="text-muted-foreground">vs previous period</span>
          </p>
          <p v-else class="mt-2 text-sm text-muted-foreground">{{ tile.caption }}</p>
        </UiCardContent>
      </UiCard>
    </template>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{ trends?: AnalyticsTrends }>();

  const tiles = computed(() => {
    const trends = props.trends!;
    const { metric, range, summary } = trends;
    const unit = range === "12m" ? "month" : "day";
    return [
      {
        label: metric === "averageOrder" ? "Average order" : "Total",
        value: formatMetric(metric, summary.total),
        change: summary.changePercent,
      },
      {
        label: `Average per ${unit}`,
        value: formatMetric(metric, summary.averagePerPeriod),
        caption: `Across the selected ${range === "12m" ? "year" : "range"}`,
      },
      {
        label: `Best ${unit}`,
        value: formatMetric(metric, summary.best.value),
        caption: formatPeriod(summary.best.date, range),
      },
      {
        label: `Slowest ${unit}`,
        value: formatMetric(metric, summary.worst.value),
        caption: formatPeriod(summary.worst.date, range),
      },
    ];
  });
</script>
