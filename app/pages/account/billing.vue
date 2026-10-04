<template>
  <div class="mx-auto w-full max-w-4xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Billing</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Your plan, how much of it you use, and your payment history. This is a demo, so nothing is
        ever charged.
      </p>
    </div>

    <AppErrorState v-if="error && !overview" what="your plan" @retry="refresh()" />
    <template v-else-if="!overview">
      <UiSkeleton class="h-56 w-full" />
      <UiSkeleton class="h-48 w-full" />
    </template>
    <template v-else>
      <BillingPlanCard
        :overview="overview"
        :busy="busy"
        @change="choosing = true"
        @cancel="confirmingCancel = true"
        @resume="resume"
      />
      <BillingPaymentMethodsCard :methods="overview.paymentMethods" @changed="overview = $event" />
    </template>

    <BillingInvoicesCard :invoices="invoices" :error="invoicesError" @retry="refreshInvoices()" />

    <BillingPlansDialog
      v-if="overview"
      :open="choosing"
      :subscription="overview.subscription"
      @close="choosing = false"
      @changed="onPlanChanged"
    />
    <AppConfirmDialog
      v-if="overview"
      :open="confirmingCancel"
      title="Cancel your plan?"
      :description="`You can keep using ${overview.plan.name} until ${formatDate(overview.subscription.renewsAt)}. After that your store goes read-only. You can change your mind before then.`"
      confirm-label="Cancel plan"
      destructive
      @close="confirmingCancel = false"
      @confirm="cancel"
    />
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Billing" });

  const {
    data: overview,
    error,
    refresh,
  } = useFetch<BillingOverview>("/api/billing", { key: "billing", server: false });
  const {
    data: invoices,
    error: invoicesError,
    refresh: refreshInvoices,
  } = useFetch<Invoice[]>("/api/billing/invoices", { key: "billing-invoices", server: false });

  const choosing = ref(false);
  const confirmingCancel = ref(false);
  const busy = ref(false);

  /** Runs a change to the subscription and shows what it returned. */
  async function change(path: string, success: string, failure: string) {
    busy.value = true;
    try {
      overview.value = await $fetch<BillingOverview>(path, { method: "POST" });
      useSonner(success);
    } catch (e) {
      useSonner.error(failure, { description: getErrorMessage(e) });
    } finally {
      busy.value = false;
    }
  }

  const cancel = () => {
    confirmingCancel.value = false;
    return change("/api/billing/subscription/cancel", "Plan set to cancel", "Couldn't cancel");
  };
  const resume = () =>
    change("/api/billing/subscription/resume", "Your plan will renew", "Couldn't keep your plan");

  // A new plan adds an invoice, so the list is fetched again.
  function onPlanChanged(updated: BillingOverview) {
    overview.value = updated;
    choosing.value = false;
    refreshInvoices();
  }
</script>
