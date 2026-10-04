<template>
  <UiDialog :open="open" @update:open="onOpen">
    <UiDialogContent class="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
      <UiDialogHeader>
        <UiDialogTitle title="Change your plan" />
        <UiDialogDescription
          description="Plans are limited by products, team members and orders. Changes take effect straight away."
        />
      </UiDialogHeader>

      <div class="flex items-center justify-center gap-3 text-sm">
        <span :class="!yearly && 'font-semibold'">Monthly</span>
        <UiSwitch v-model="yearly" aria-label="Bill yearly" :disabled="Boolean(saving)" />
        <span :class="yearly && 'font-semibold'">
          Yearly
          <UiBadge variant="success" size="sm" class="ml-1">2 months free</UiBadge>
        </span>
      </div>

      <UiAlert
        v-if="formError"
        variant="destructive"
        icon="lucide:circle-alert"
        :description="formError"
      />

      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="plan in PLANS"
          :key="plan.id"
          class="flex flex-col rounded-lg border p-4"
          :class="isCurrent(plan) && 'border-primary ring-1 ring-primary'"
        >
          <div class="flex items-center justify-between gap-2">
            <h3 class="font-semibold">{{ plan.name }}</h3>
            <UiBadge v-if="isCurrent(plan)" size="sm">Current</UiBadge>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">{{ plan.tagline }}</p>
          <p class="mt-4">
            <span class="text-3xl font-bold">{{ formatCurrency(plan.price[interval], true) }}</span>
            <span class="text-sm text-muted-foreground">/{{ yearly ? "year" : "month" }}</span>
          </p>
          <ul class="mt-4 flex-1 space-y-2 text-sm">
            <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2">
              <Icon name="lucide:check" class="mt-0.5 size-4 text-emerald-500" />
              {{ feature }}
            </li>
          </ul>
          <UiButton
            class="mt-5 w-full"
            :variant="isCurrent(plan) ? 'outline' : 'default'"
            :disabled="isCurrent(plan) || Boolean(saving)"
            :loading="saving === plan.id"
            @click="choose(plan)"
          >
            {{ isCurrent(plan) ? "Current plan" : `Switch to ${plan.name}` }}
          </UiButton>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
  const props = defineProps<{ open: boolean; subscription: Subscription }>();
  const emit = defineEmits<{ close: []; changed: [overview: BillingOverview] }>();

  const yearly = ref(props.subscription.interval === "yearly");
  const interval = computed<BillingInterval>(() => (yearly.value ? "yearly" : "monthly"));
  const saving = ref<PlanId>();
  const formError = ref("");

  // Start from the current billing period each time the dialog opens.
  watch(
    () => props.open,
    (value) => {
      if (!value) return;
      yearly.value = props.subscription.interval === "yearly";
      formError.value = "";
    }
  );
  watch(yearly, () => (formError.value = ""));

  const isCurrent = (plan: Plan) =>
    props.subscription.planId === plan.id &&
    props.subscription.interval === interval.value &&
    props.subscription.status === "active";

  function onOpen(value: boolean) {
    if (!value && !saving.value) emit("close");
  }

  async function choose(plan: Plan) {
    formError.value = "";
    saving.value = plan.id;
    try {
      const overview = await $fetch<BillingOverview>("/api/billing/subscription", {
        method: "PUT",
        body: { planId: plan.id, interval: interval.value },
      });
      useSonner(`You're on the ${plan.name} plan`, {
        description: `Billed ${interval.value}. Your next renewal is ${formatDate(overview.subscription.renewsAt)}.`,
      });
      emit("changed", overview);
    } catch (error) {
      formError.value = getErrorMessage(error);
    } finally {
      saving.value = undefined;
    }
  }
</script>
