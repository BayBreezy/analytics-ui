<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Analytics overview</h1>
        <p class="mt-1 text-sm text-muted-foreground">How your store is performing.</p>
      </div>
      <AnalyticsRangeTabs v-model="range" />
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="error && !data">
        <UiCard class="sm:col-span-2 xl:col-span-4">
          <AppErrorState what="analytics" @retry="refresh()" />
        </UiCard>
      </template>
      <template v-else-if="!data">
        <UiCard v-for="n in 4" :key="n">
          <UiCardContent class="flex items-start justify-between gap-4">
            <div class="flex-1 space-y-3">
              <UiSkeleton class="h-4 w-24" />
              <UiSkeleton class="h-8 w-32" />
              <UiSkeleton class="h-4 w-40" />
            </div>
            <UiSkeleton class="size-12 rounded-full" />
          </UiCardContent>
        </UiCard>
      </template>
      <template v-else>
        <DashboardStatCard
          v-for="stat in data.kpis"
          :key="stat.id"
          :stat="stat"
          :icon="kpiIcons[stat.id]"
          :color="kpiColors[stat.id]"
        />
      </template>
    </div>

    <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
      <div class="*:h-full lg:col-span-2">
        <AnalyticsRevenueComparison
          :overview="data"
          :range="range"
          :refreshing="pending && !!data"
          :error="error && !data ? error : undefined"
          @retry="refresh()"
        />
      </div>
      <AnalyticsCategoryDonut
        :categories="data?.categories"
        :refreshing="pending && !!data"
        :error="error && !data ? error : undefined"
        @retry="refresh()"
      />
    </div>

    <AnalyticsTopProducts
      :products="data?.topProducts"
      :refreshing="pending && !!data"
      :error="error && !data ? error : undefined"
      @retry="refresh()"
    />
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Analytics overview" });

  const range = useQueryParam<SalesRange>("range", "30d", ["7d", "30d", "12m"]);

  const { data, pending, error, refresh } = useFetch<AnalyticsOverview>("/api/analytics/overview", {
    key: "analytics-overview",
    query: { range },
    server: false,
  });

  const kpiIcons: Record<string, string> = {
    revenue: "lucide:dollar-sign",
    averageOrder: "lucide:receipt",
    conversion: "lucide:mouse-pointer-click",
    repeat: "lucide:repeat",
  };
  const kpiColors: Record<string, "success" | "warning" | "purple" | "teal"> = {
    revenue: "success",
    averageOrder: "warning",
    conversion: "purple",
    repeat: "teal",
  };
</script>
