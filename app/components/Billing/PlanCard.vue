<template>
  <UiCard>
    <UiCardHeader class="flex flex-col md:grid">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <UiFancyIcon icon="lucide:gem" theme="gradient" color="purple" size="md" />
        <div class="min-w-0">
          <UiCardTitle class="flex flex-wrap items-center gap-2">
            {{ overview.plan.name }} plan
            <UiBadge :variant="canceling ? 'warning' : 'success'" size="sm">
              {{ canceling ? "Cancels soon" : "Active" }}
            </UiBadge>
          </UiCardTitle>
          <UiCardDescription class="mt-1">
            {{ formatCurrency(price, true) }} per {{ interval === "yearly" ? "year" : "month" }}
            ·
            {{ canceling ? "Ends on" : "Renews on" }}
            {{ formatDate(overview.subscription.renewsAt) }}
          </UiCardDescription>
        </div>
      </div>
      <UiCardFooter class="px-0">
        <UiCardAction class="flex flex-wrap justify-end gap-2">
          <UiButton variant="outline" @click="emit('change')" size="sm">Change plan</UiButton>
          <UiButton v-if="canceling" :loading="busy" @click="emit('resume')" size="sm"
            >Keep my plan</UiButton
          >
          <UiButton v-else variant="ghost" :disabled="busy" @click="emit('cancel')" size="sm">
            Cancel plan
          </UiButton>
        </UiCardAction>
      </UiCardFooter>
    </UiCardHeader>
    <UiCardContent class="space-y-5">
      <UiAlert
        v-if="canceling"
        variant="warning"
        icon="lucide:triangle-alert"
        :description="`Your plan won't renew. You can keep using ${overview.plan.name} until ${formatDate(overview.subscription.renewsAt)}.`"
      />
      <div class="grid gap-5 sm:grid-cols-3">
        <div v-for="item in overview.usage" :key="item.key" class="space-y-2">
          <div class="flex items-baseline justify-between gap-2 text-sm">
            <span class="font-medium">{{ item.label }}</span>
            <span class="shrink-0 text-muted-foreground">
              {{ formatNumber(item.used) }} / {{ formatNumber(item.limit) }}
            </span>
          </div>
          <UiProgress
            :model-value="Math.min(item.used, item.limit)"
            :max="item.limit"
            :aria-label="item.label"
            :class="usageColor(item)"
          />
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const props = defineProps<{ overview: BillingOverview; busy?: boolean }>();
  const emit = defineEmits<{ change: []; cancel: []; resume: [] }>();

  const canceling = computed(() => props.overview.subscription.status === "canceling");
  const interval = computed(() => props.overview.subscription.interval);
  const price = computed(() => props.overview.plan.price[interval.value]);

  /** Green while there's room, amber from 80%, red at the limit. */
  function usageColor(item: UsageItem) {
    const share = item.used / item.limit;
    if (share >= 1) return "[--primary:var(--color-red-500)]";
    if (share >= 0.8) return "[--primary:var(--color-amber-500)]";
    return "[--primary:var(--color-emerald-500)]";
  }
</script>
