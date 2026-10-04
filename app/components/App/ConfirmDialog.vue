<template>
  <UiAlertDialog :open="open" :title="title" :description="description" @update:open="onOpen">
    <template #action>
      <UiAlertDialogAction
        :variant="destructive ? 'destructive' : 'default'"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </UiAlertDialogAction>
    </template>
  </UiAlertDialog>
</template>

<script lang="ts" setup>
  withDefaults(
    defineProps<{
      open: boolean;
      title: string;
      description: string;
      confirmLabel?: string;
      /** Styles the confirm button as destructive. */
      destructive?: boolean;
    }>(),
    { confirmLabel: "Confirm", destructive: false }
  );
  const emit = defineEmits<{ confirm: []; close: [] }>();

  const onOpen = (value: boolean) => {
    if (!value) emit("close");
  };
</script>
