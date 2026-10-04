<template>
  <AnalyticsChartCard
    :title="title"
    :description="description"
    type="donut"
    :series="series"
    :options="options"
    :loading="!categories && !error"
    :refreshing="refreshing"
    :error="error"
    :empty="categories?.length === 0"
    :height="320"
    @retry="emit('retry')"
  />
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const props = withDefaults(
    defineProps<{
      categories?: CategoryStat[];
      title?: string;
      description?: string;
      refreshing?: boolean;
      error?: unknown;
    }>(),
    { title: "Sales by category", description: "Share of revenue per category" }
  );
  const emit = defineEmits<{ retry: [] }>();

  const colors = useChartColors();
  const palette = computed(() => extendColors(colors.value, props.categories?.length ?? 5));

  const series = computed(() => props.categories?.map((c) => c.revenue) ?? []);

  const options = computed<ApexOptions>(() => ({
    ...baseChartOptions(palette.value),
    labels: props.categories?.map((c) => c.category) ?? [],
    stroke: { width: 0 },
    legend: { position: "bottom", markers: { size: 6 } },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            value: { formatter: (value: string) => formatCurrency(Number(value), true) },
            total: {
              show: true,
              label: "Revenue",
              formatter: (w: { globals: { seriesTotals: number[] } }) =>
                formatCurrency(
                  w.globals.seriesTotals.reduce((total, value) => total + value, 0),
                  true
                ),
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (value: number) => formatCurrency(value) } },
  }));
</script>
