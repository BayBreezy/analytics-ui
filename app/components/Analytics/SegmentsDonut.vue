<template>
  <AnalyticsChartCard
    title="Customer loyalty"
    description="Customers by number of orders"
    type="donut"
    :series="series"
    :options="options"
    :loading="!segments && !error"
    :error="error"
    :empty="series.every((value) => value === 0)"
    :height="320"
    @retry="emit('retry')"
  />
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const props = defineProps<{
    segments?: AnalyticsStatistics["segments"];
    error?: unknown;
  }>();
  const emit = defineEmits<{ retry: [] }>();

  const colors = useChartColors();

  const series = computed(() =>
    props.segments ? [props.segments.repeat, props.segments.once, props.segments.none] : []
  );

  const options = computed<ApexOptions>(() => ({
    ...baseChartOptions([colors.value[1]!, colors.value[0]!, "#94a3b8"]),
    labels: ["Repeat (2+ orders)", "One order", "No orders yet"],
    stroke: { width: 0 },
    legend: { position: "bottom", markers: { size: 6 } },
    plotOptions: {
      pie: {
        donut: { size: "68%", labels: { show: true, total: { show: true, label: "Customers" } } },
      },
    },
    tooltip: { y: { formatter: (value: number) => `${formatNumber(value)} customers` } },
  }));
</script>
