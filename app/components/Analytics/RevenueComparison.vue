<template>
  <AnalyticsChartCard
    title="Revenue"
    description="This period compared with the one before"
    type="line"
    :series="series"
    :options="options"
    :loading="!overview && !error"
    :refreshing="refreshing"
    :error="error"
    :height="320"
    @retry="emit('retry')"
  />
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const props = defineProps<{
    overview?: AnalyticsOverview;
    range: SalesRange;
    refreshing?: boolean;
    error?: unknown;
  }>();
  const emit = defineEmits<{ retry: [] }>();

  const colors = useChartColors();
  const isNarrow = useMediaQuery("(max-width: 640px)");

  const series = computed(() => [
    { name: "Revenue", type: "area", data: props.overview?.series.map((p) => p.revenue) ?? [] },
    {
      name: "Previous period",
      type: "line",
      data: props.overview?.previous.map((p) => p.revenue) ?? [],
    },
  ]);

  const options = computed<ApexOptions>(() => ({
    ...baseChartOptions([colors.value[0]!, "#94a3b8"]),
    stroke: { curve: "smooth", width: [2.5, 2], dashArray: [0, 6] },
    fill: {
      type: ["gradient", "solid"],
      colors: [colors.value[0]!, "#94a3b8"],
      gradient: { shade: "light", type: "vertical", opacityFrom: 0.4, opacityTo: 0.02 },
    },
    markers: { size: 0, hover: { size: 5 } },
    xaxis: {
      categories:
        props.overview?.series.map((p) =>
          rangeLabelFormatter(props.range).format(new Date(p.date))
        ) ?? [],
      tickAmount: props.range === "30d" ? (isNarrow.value ? 3 : 6) : undefined,
      labels: { rotate: 0, hideOverlappingLabels: true },
      tooltip: { enabled: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: axisCurrency } },
    tooltip: { shared: true, intersect: false, y: { formatter: (value) => formatCurrency(value) } },
  }));
</script>
