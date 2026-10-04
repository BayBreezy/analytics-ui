<template>
  <AnalyticsChartCard
    title="When customers order"
    description="Orders by weekday and time of day"
    type="heatmap"
    :series="series"
    :options="options"
    :loading="!heatmap && !error"
    :error="error"
    :height="320"
    @retry="emit('retry')"
  />
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const props = defineProps<{ heatmap?: AnalyticsStatistics["heatmap"]; error?: unknown }>();
  const emit = defineEmits<{ retry: [] }>();

  const colors = useChartColors();
  const SLOTS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

  // ApexCharts draws the first series at the bottom, so reverse to put Monday on top.
  const series = computed(() =>
    [...(props.heatmap ?? [])].reverse().map((row) => ({
      name: row.day,
      data: row.slots.map((value, index) => ({ x: SLOTS[index]!, y: value })),
    }))
  );

  // Five shades of the primary chart color with an alpha, so low cells fade into the card in both
  // light and dark mode.
  const max = computed(() => Math.max(1, ...(props.heatmap ?? []).flatMap((row) => row.slots)));
  const ranges = computed(() =>
    [0.2, 0.4, 0.6, 0.8, 1].map((share, index, all) => ({
      from: index === 0 ? 0 : Math.floor(max.value * all[index - 1]!) + 1,
      to: Math.floor(max.value * share),
      name: `up to ${Math.floor(max.value * share)}`,
      color: withAlpha(colors.value[0]!, 0.12 + index * 0.22),
    }))
  );

  const options = computed<ApexOptions>(() => ({
    ...baseChartOptions([colors.value[0]!]),
    plotOptions: {
      heatmap: { radius: 4, enableShades: false, colorScale: { ranges: ranges.value } },
    },
    stroke: { width: 2, colors: ["var(--color-card)"] },
    legend: { show: false },
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
    tooltip: { shared: false, y: { formatter: (value: number) => `${value} orders` } },
  }));
</script>
