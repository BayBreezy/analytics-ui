<template>
  <AnalyticsChartCard
    :title="`${metricLabel} over time`"
    :description="
      compare ? 'With the previous period and a moving average' : 'With a moving average'
    "
    type="line"
    :series="series"
    :options="options"
    :loading="!trends && !error"
    :refreshing="refreshing"
    :error="error"
    :height="360"
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

  const colors = useChartColors();
  const isNarrow = useMediaQuery("(max-width: 640px)");

  const metric = computed(() => props.trends?.metric ?? "revenue");
  const range = computed(() => props.trends?.range ?? "30d");
  const compare = computed(() => props.trends?.compare ?? false);
  const metricLabel = computed(() => METRIC_OPTIONS.find((o) => o.value === metric.value)!.label);
  const average = computed(() => (range.value === "12m" ? "3-month" : "7-day") + " average");

  const series = computed(() => {
    const points = props.trends?.points ?? [];
    return [
      { name: metricLabel.value, type: "area", data: points.map((p) => p.value) },
      ...(compare.value
        ? [{ name: "Previous period", type: "line", data: points.map((p) => p.previous ?? 0) }]
        : []),
      { name: average.value, type: "line", data: points.map((p) => p.average) },
    ];
  });

  const options = computed<ApexOptions>(() => {
    const palette = compare.value
      ? [colors.value[0]!, "#94a3b8", colors.value[2]!]
      : [colors.value[0]!, colors.value[2]!];
    const widths = compare.value ? [2.5, 2, 2] : [2.5, 2];
    return {
      ...baseChartOptions(palette),
      stroke: {
        curve: "smooth",
        width: widths,
        dashArray: compare.value ? [0, 6, 0] : [0, 0],
      },
      fill: {
        type: ["gradient", ...widths.slice(1).map(() => "solid")],
        colors: palette,
        gradient: { shade: "light", type: "vertical", opacityFrom: 0.4, opacityTo: 0.02 },
      },
      markers: { size: 0, hover: { size: 5 } },
      xaxis: {
        categories:
          props.trends?.points.map((p) =>
            rangeLabelFormatter(range.value).format(new Date(p.date))
          ) ?? [],
        tickAmount: range.value === "30d" ? (isNarrow.value ? 3 : 6) : undefined,
        labels: { rotate: 0, hideOverlappingLabels: true },
        tooltip: { enabled: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (value: number) =>
            metric.value === "revenue" || metric.value === "averageOrder"
              ? formatCompactCurrency(value)
              : formatNumber(Math.round(value)),
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (value: number) => formatMetric(metric.value, value) },
      },
    };
  });
</script>
