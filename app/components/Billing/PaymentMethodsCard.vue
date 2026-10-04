<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Payment method</UiCardTitle>
      <UiCardDescription>
        Demo cards only. Real card numbers are never asked for or stored.
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <ul class="divide-y rounded-lg border">
        <li
          v-for="method in methods"
          :key="method.id"
          class="flex flex-wrap items-center gap-x-4 gap-y-2 p-3"
        >
          <UiFancyIcon icon="lucide:credit-card" theme="light" color="gray" size="sm" />
          <div class="min-w-0 flex-1 basis-40">
            <p class="text-sm font-medium">
              {{ BRAND_NAMES[method.brand] }} ending in {{ method.last4 }}
            </p>
            <p class="text-xs text-muted-foreground">
              Expires {{ String(method.expMonth).padStart(2, "0") }}/{{ method.expYear }}
            </p>
          </div>
          <UiBadge v-if="method.isDefault" variant="secondary">Default</UiBadge>
          <UiButton
            v-else
            variant="outline"
            size="sm"
            :aria-label="`Make the ${BRAND_NAMES[method.brand]} card ending in ${method.last4} the default`"
            :loading="busy === method.id"
            :disabled="Boolean(busy)"
            @click="makeDefault(method)"
            class="w-full md:w-auto"
          >
            Make default
          </UiButton>
        </li>
      </ul>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  defineProps<{ methods: PaymentMethod[] }>();
  const emit = defineEmits<{ changed: [overview: BillingOverview] }>();

  const BRAND_NAMES = { visa: "Visa", mastercard: "Mastercard", amex: "American Express" } as const;
  const busy = ref<string>();

  async function makeDefault(method: PaymentMethod) {
    busy.value = method.id;
    try {
      const overview = await $fetch<BillingOverview>(
        `/api/billing/payment-methods/${method.id}/default`,
        { method: "POST" }
      );
      emit("changed", overview);
      useSonner("Default card updated", {
        description: `${BRAND_NAMES[method.brand]} ending in ${method.last4} will be charged next.`,
      });
    } catch (error) {
      useSonner.error("Couldn't change the default card", { description: getErrorMessage(error) });
    } finally {
      busy.value = undefined;
    }
  }
</script>
