<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Stock health</UiCardTitle>
      <UiCardDescription>Active products by how much is left</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <AppErrorState v-if="error" what="stock" @retry="emit('retry')" />
      <div v-else-if="!stock" class="space-y-6">
        <div v-for="n in 3" :key="n" class="space-y-2">
          <UiSkeleton class="h-4 w-32" />
          <UiSkeleton class="h-2 w-full" />
        </div>
      </div>
      <div v-else class="space-y-6">
        <div v-for="row in rows" :key="row.label" class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium">{{ row.label }}</span>
            <span class="text-muted-foreground">
              {{ formatNumber(row.value) }} of {{ formatNumber(stock.total) }}
            </span>
          </div>
          <UiProgress :model-value="row.value" :max="stock.total || 1" :class="row.track" />
        </div>
        <UiButton variant="outline" size="sm" to="/products?status=active&sort=stock&order=asc">
          View lowest stock
        </UiButton>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const props = defineProps<{ stock?: AnalyticsStatistics["stock"]; error?: unknown }>();
  const emit = defineEmits<{ retry: [] }>();

  const rows = computed(() => [
    {
      label: "In stock",
      value: props.stock?.inStock ?? 0,
      track: "[--primary:var(--color-emerald-500)]",
    },
    {
      label: "Low stock",
      value: props.stock?.low ?? 0,
      track: "[--primary:var(--color-amber-500)]",
    },
    {
      label: "Out of stock",
      value: props.stock?.out ?? 0,
      track: "[--primary:var(--color-red-500)]",
    },
  ]);
</script>
