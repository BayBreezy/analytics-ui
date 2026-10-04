<template>
  <UiCard class="border-destructive/40">
    <UiCardHeader>
      <UiCardTitle>Reset demo data</UiCardTitle>
      <UiCardDescription>
        Throws away every customer, order, product, team change and setting you've made and goes
        back to the original sample data. Your own account and this browser's preferences are kept.
      </UiCardDescription>
      <UiCardAction>
        <UiButton variant="destructive" :loading="resetting" @click="confirming = true">
          Reset demo data
        </UiButton>
      </UiCardAction>
    </UiCardHeader>
  </UiCard>

  <AppConfirmDialog
    :open="confirming"
    title="Reset all demo data?"
    description="Everything you've created or changed will be replaced with the original sample data. This can't be undone."
    confirm-label="Reset data"
    destructive
    @close="confirming = false"
    @confirm="onConfirm"
  />
</template>

<script lang="ts" setup>
  const { refresh } = useSettings();
  const confirming = ref(false);
  const resetting = ref(false);

  async function onConfirm() {
    confirming.value = false;
    resetting.value = true;
    try {
      await $fetch("/api/settings/reset", { method: "POST" });
      // Lists fetch again when opened. The settings are on screen, so they refresh now.
      await refresh();
      useSonner("Demo data reset", { description: "Everything is back to the sample data." });
    } catch (error) {
      useSonner.error("Couldn't reset the data", { description: getErrorMessage(error) });
    } finally {
      resetting.value = false;
    }
  }
</script>
