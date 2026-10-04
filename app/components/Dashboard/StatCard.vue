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
      <UiFancyIcon :icon="iconName" :color="iconColor" theme="gradient" size="lg" />
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  type IconColor =
    | "success"
    | "primary"
    | "info"
    | "warning"
    | "error"
    | "purple"
    | "pink"
    | "teal";

  const props = defineProps<{
    stat: StatCard;
    /** Overrides the icon chosen from the stat's id. */
    icon?: string;
    /** Overrides the icon color chosen from the stat's id. */
    color?: IconColor;
  }>();

  const icons: Record<string, string> = {
    revenue: "lucide:dollar-sign",
    orders: "lucide:shopping-bag",
    customers: "lucide:user-plus",
    averageOrder: "lucide:receipt",
  };

  const colors: Record<string, IconColor> = {
    revenue: "success",
    orders: "primary",
    customers: "info",
    averageOrder: "warning",
  };

  const iconName = computed(() => props.icon ?? icons[props.stat.id] ?? "lucide:chart-column");
  const iconColor = computed(() => props.color ?? colors[props.stat.id] ?? "primary");
  const value = computed(() => {
    if (props.stat.format === "currency")
      return formatCurrency(props.stat.value, props.stat.value >= 1000);
    if (props.stat.format === "percent") return formatPercent(props.stat.value);
    return formatNumber(props.stat.value);
  });
</script>
