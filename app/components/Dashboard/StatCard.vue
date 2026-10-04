<template>
  <UiCard>
    <UiCardContent class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-muted-foreground">{{ stat.label }}</p>
        <p class="mt-2 text-2xl font-bold tracking-tight">{{ value }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-x-1.5 text-sm">
          <span
            class="flex items-center gap-1 font-medium"
            :class="
              stat.trend === 'up'
                ? 'text-emerald-600 dark:text-emerald-500'
                : 'text-red-600 dark:text-red-500'
            "
          >
            <Icon :name="stat.trend === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'" />
            {{ stat.changePercent > 0 ? "+" : "" }}{{ stat.changePercent }}%
          </span>
          <span class="text-muted-foreground">{{ stat.caption }}</span>
        </div>
      </div>
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
      >
        <Icon :name="icon" class="size-5" />
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const props = defineProps<{ stat: StatCard }>();

  const icons: Record<StatCard["id"], string> = {
    revenue: "lucide:dollar-sign",
    orders: "lucide:shopping-bag",
    customers: "lucide:user-plus",
    averageOrder: "lucide:receipt",
  };

  const icon = computed(() => icons[props.stat.id]);
  const value = computed(() =>
    props.stat.format === "currency"
      ? formatCurrency(props.stat.value, props.stat.value >= 1000)
      : formatNumber(props.stat.value)
  );
</script>
