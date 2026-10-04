<template>
  <UiCard class="h-full">
    <UiCardHeader>
      <UiCardTitle>Sales overview</UiCardTitle>
      <UiCardDescription>Revenue and orders over time</UiCardDescription>
      <UiCardAction>
        <UiTabs v-model="range">
          <UiTabsList>
            <UiTabsTrigger v-for="option in ranges" :key="option.value" :value="option.value">
              <span class="sm:hidden">{{ option.short }}</span>
              <span class="hidden sm:inline">{{ option.label }}</span>
            </UiTabsTrigger>
          </UiTabsList>
        </UiTabs>
      </UiCardAction>
    </UiCardHeader>
    <UiCardContent>
      <AppErrorState v-if="error" what="sales" @retry="refresh()" />
      <template v-else>
        <div class="mb-4 flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p class="text-sm text-muted-foreground">Revenue</p>
            <UiSkeleton v-if="!data" class="mt-1 h-7 w-28" />
            <p v-else class="text-2xl font-bold tracking-tight">
              {{ formatCurrency(data.totals.revenue, true) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Orders</p>
            <UiSkeleton v-if="!data" class="mt-1 h-7 w-16" />
            <p v-else class="text-2xl font-bold tracking-tight">
              {{ formatNumber(data.totals.orders) }}
            </p>
          </div>
        </div>
        <div class="h-[300px] w-full" :class="pending && data && 'opacity-60 transition-opacity'">
          <UiSkeleton v-if="!data" class="h-full w-full" />
          <UiApexchart v-else type="line" :series="series" :options="options" />
        </div>
      </template>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  const ranges: { value: SalesRange; label: string; short: string }[] = [
    { value: "7d", label: "7 days", short: "7D" },
    { value: "30d", label: "30 days", short: "30D" },
    { value: "12m", label: "12 months", short: "12M" },
  ];

  const range = ref<SalesRange>("30d");
  const { data, pending, error, refresh } = useFetch<SalesResponse>("/api/dashboard/sales", {
    key: "dashboard-sales",
    query: { range },
    server: false,
  });

  const colors = useChartColors();
  const isNarrow = useMediaQuery("(max-width: 640px)");

  const labelFormat = computed(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        ...(range.value === "12m"
          ? { month: "short" }
          : range.value === "7d"
            ? { weekday: "short" }
            : { month: "short", day: "numeric" }),
      })
  );

  const categories = computed(
    () => data.value?.points.map((point) => labelFormat.value.format(new Date(point.date))) ?? []
  );

  const series = computed(() => [
    { name: "Revenue", type: "area", data: data.value?.points.map((p) => p.revenue) ?? [] },
    { name: "Orders", type: "line", data: data.value?.points.map((p) => p.orders) ?? [] },
  ]);

  const options = computed<ApexOptions>(() => ({
    chart: {
      type: "line",
      toolbar: { show: false },
      parentHeightOffset: 0,
      background: "transparent",
      zoom: { enabled: false },
    },
    colors: colors.value,
    stroke: { curve: "smooth", width: [2.5, 2] },
    fill: {
      type: ["gradient", "solid"],
      colors: colors.value,
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        opacityFrom: 0.4,
        opacityTo: 0.02,
        stops: [0, 95, 100],
      },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
    grid: { strokeDashArray: 4, xaxis: { lines: { show: false } } },
    legend: { position: "top", horizontalAlign: "right", markers: { size: 6 } },
    tooltip: { shared: true, intersect: false },
    xaxis: {
      categories: categories.value,
      tickAmount: range.value === "30d" ? (isNarrow.value ? 3 : 6) : undefined,
      labels: { rotate: 0, hideOverlappingLabels: true },
      tooltip: { enabled: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        seriesName: "Revenue",
        labels: { formatter: (value: number) => formatCompactCurrency(value) },
      },
      {
        seriesName: "Orders",
        opposite: true,
        show: false,
        labels: { formatter: (value: number) => formatNumber(Math.round(value)) },
      },
    ],
  }));
</script>
