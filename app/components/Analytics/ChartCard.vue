<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>{{ title }}</UiCardTitle>
      <UiCardDescription v-if="description">{{ description }}</UiCardDescription>
      <UiCardAction v-if="$slots.actions">
        <slot name="actions" />
      </UiCardAction>
    </UiCardHeader>
    <UiCardContent>
      <AppErrorState v-if="error" :what="title.toLowerCase()" @retry="emit('retry')" />
      <div
        v-else
        class="w-full transition-opacity"
        :class="refreshing && 'opacity-60'"
        :style="{ height: `${height}px` }"
      >
        <UiSkeleton v-if="loading" class="h-full w-full" />
        <UiEmpty v-else-if="empty" class="h-full">
          <UiEmptyHeader>
            <UiEmptyMedia variant="icon"><Icon name="lucide:chart-no-axes-column" /></UiEmptyMedia>
            <UiEmptyTitle>No data yet</UiEmptyTitle>
            <UiEmptyDescription>There is nothing to chart for this period.</UiEmptyDescription>
          </UiEmptyHeader>
        </UiEmpty>
        <UiApexchart v-else :type="type" :series="series" :options="options" />
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  import type { ApexOptions } from "apexcharts";

  withDefaults(
    defineProps<{
      title: string;
      description?: string;
      type: "line" | "area" | "bar" | "donut" | "pie" | "radialBar" | "heatmap";
      series: ApexOptions["series"];
      options: ApexOptions;
      /** No data has arrived yet (first load). Shows a skeleton. */
      loading?: boolean;
      /** Data is being refetched (e.g. after a range change). Dims the chart. */
      refreshing?: boolean;
      error?: unknown;
      /** There is no data to chart. Shows an empty state. */
      empty?: boolean;
      /** Chart height in pixels. */
      height?: number;
    }>(),
    { height: 300 }
  );

  const emit = defineEmits<{ retry: [] }>();
</script>
