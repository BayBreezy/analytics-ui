<template>
  <UiCard class="border-destructive/40 md:flex-row">
    <UiCardHeader class="flex-1">
      <UiCardTitle>Delete account</UiCardTitle>
      <UiCardDescription>
        Signs you out and discards this demo account. Nothing else changes, because no accounts are
        stored on the server.
      </UiCardDescription>
    </UiCardHeader>
    <UiCardFooter>
      <UiCardAction>
        <UiButton variant="destructive" @click="confirming = true">Delete account</UiButton>
      </UiCardAction>
    </UiCardFooter>
  </UiCard>

  <AppConfirmDialog
    :open="confirming"
    title="Delete your account?"
    description="You'll be signed out and will need to register again to come back."
    confirm-label="Delete account"
    destructive
    @close="confirming = false"
    @confirm="onConfirm"
  />
</template>

<script lang="ts" setup>
  const { logout } = useAuth();
  const confirming = ref(false);

  async function onConfirm() {
    await logout();
    useSonner("Account deleted");
  }
</script>
