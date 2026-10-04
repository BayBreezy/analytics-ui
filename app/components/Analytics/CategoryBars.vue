<template>
  <AnalyticsChartCard
    title="Revenue by category"
    description="Revenue and orders for every product category"
    type="bar"
    :series="series"
    :options="options"
    :loading="!categories && !error"
    :error="error"
    :empty="categories?.length === 0"
    :height="320"
    @retry="emit('retry')"
  />
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const props = defineProps<{ categories?: CategoryStat[]; error?: unknown }>();
  const emit = defineEmits<{ retry: [] }>();

  const colors = useChartColors();

  const series = computed(() => [
    { name: "Revenue", data: props.categories?.map((c) => c.revenue) ?? [] },
  ]);

  const options = computed<ApexOptions>(() => ({
    ...baseChartOptions(extendColors(colors.value, props.categories?.length ?? 5)),
    plotOptions: { bar: { distributed: true, borderRadius: 6, columnWidth: "55%" } },
    xaxis: {
      categories: props.categories?.map((c) => c.category) ?? [],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: axisCurrency } },
    legend: { show: false },
    tooltip: {
      shared: false,
      intersect: false,
      y: { formatter: (value: number) => formatCurrency(value) },
    },
  }));
</script>
