<template>
  <AnalyticsChartCard
    title="Orders by status"
    description="Where every order stands"
    type="donut"
    :series="series"
    :options="options"
    :loading="!statuses && !error"
    :error="error"
    :empty="total === 0"
    :height="320"
    @retry="emit('retry')"
  />
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const props = defineProps<{
    statuses?: AnalyticsStatistics["statuses"];
    error?: unknown;
  }>();
  const emit = defineEmits<{ retry: [] }>();

  // Fixed colors so a status always looks the same, matching the status badges.
  const STATUS_COLORS: Record<OrderStatus, string> = {
    pending: "#f59e0b",
    paid: "#22c55e",
    shipped: "#3b82f6",
    refunded: "#94a3b8",
    cancelled: "#ef4444",
  };

  const series = computed(() => props.statuses?.map((entry) => entry.count) ?? []);
  const total = computed(() => series.value.reduce((sum, count) => sum + count, 0));

  const options = computed<ApexOptions>(() => ({
    ...baseChartOptions(props.statuses?.map((entry) => STATUS_COLORS[entry.status]) ?? []),
    labels: props.statuses?.map((entry) => titleCase(entry.status)) ?? [],
    stroke: { width: 0 },
    legend: { position: "bottom", markers: { size: 6 } },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: { show: true, total: { show: true, label: "Orders" } },
        },
      },
    },
    tooltip: { y: { formatter: (value: number) => `${formatNumber(value)} orders` } },
  }));
</script>
