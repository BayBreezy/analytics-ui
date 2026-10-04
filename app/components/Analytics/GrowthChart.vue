<template>
  <AnalyticsChartCard
    title="Period-over-period growth"
    description="How much each period changed from the one before"
    type="bar"
    :series="series"
    :options="options"
    :loading="!trends && !error"
    :refreshing="refreshing"
    :error="error"
    :height="300"
    @retry="emit('retry')"
  />
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const props = defineProps<{
    trends?: AnalyticsTrends;
    refreshing?: boolean;
    error?: unknown;
  }>();
  const emit = defineEmits<{ retry: [] }>();

  const isNarrow = useMediaQuery("(max-width: 640px)");
  const range = computed(() => props.trends?.range ?? "30d");

  const series = computed(() => [
    { name: "Change", data: props.trends?.growth.map((point) => point.change) ?? [] },
  ]);

  const options = computed<ApexOptions>(() => ({
    ...baseChartOptions(["#22c55e"]),
    legend: { show: false },
    plotOptions: {
      bar: {
        borderRadius: 3,
        columnWidth: "70%",
        colors: {
          ranges: [
            { from: -10_000, to: -0.0001, color: "#ef4444" },
            { from: 0, to: 10_000, color: "#22c55e" },
          ],
        },
      },
    },
    xaxis: {
      categories:
        props.trends?.growth.map((p) =>
          rangeLabelFormatter(range.value).format(new Date(p.date))
        ) ?? [],
      tickAmount: range.value === "30d" ? (isNarrow.value ? 3 : 6) : undefined,
      labels: { rotate: 0, hideOverlappingLabels: true },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (value: number) => `${Math.round(value)}%` } },
    tooltip: {
      shared: false,
      intersect: false,
      y: { formatter: (value: number) => `${value > 0 ? "+" : ""}${value}%` },
    },
  }));
</script>
