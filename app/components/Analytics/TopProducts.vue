<template>
  <AnalyticsChartCard
    title="Top products"
    description="Best sellers by revenue"
    type="bar"
    :series="series"
    :options="options"
    :loading="!products && !error"
    :refreshing="refreshing"
    :error="error"
    :empty="products?.length === 0"
    :height="320"
    @retry="emit('retry')"
  />
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const props = defineProps<{
    products?: TopProduct[];
    refreshing?: boolean;
    error?: unknown;
  }>();
  const emit = defineEmits<{ retry: [] }>();

  const colors = useChartColors();

  const series = computed(() => [
    { name: "Revenue", data: props.products?.map((product) => product.revenue) ?? [] },
  ]);

  const options = computed<ApexOptions>(() => ({
    ...baseChartOptions(colors.value),
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "55%" } },
    xaxis: {
      categories: props.products?.map((product) => product.name) ?? [],
      labels: { formatter: (value: string) => axisCurrency(Number(value)) },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { maxWidth: 160 } },
    legend: { show: false },
    grid: { strokeDashArray: 4, yaxis: { lines: { show: false } } },
    tooltip: {
      shared: false,
      intersect: false,
      y: { formatter: (value: number) => formatCurrency(value) },
    },
  }));
</script>
