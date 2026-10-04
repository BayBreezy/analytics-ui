<template>
  <UiAlertDialog
    :open="Boolean(record)"
    :title="`Delete ${singular.toLowerCase()}?`"
    :description="`${record?.label ?? ''} will be permanently deleted. This can't be undone.`"
    @update:open="(open) => !open && emit('close')"
  >
    <template #action>
      <UiAlertDialogAction variant="destructive" @click="confirm">Delete</UiAlertDialogAction>
    </template>
  </UiAlertDialog>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    resource: ResourceName;
    /** The record to delete. The dialog is open while this is set. */
    record: { id: string; label: string } | null;
  }>();
  const emit = defineEmits<{ close: []; deleted: [] }>();

  const singular = computed(() => RESOURCES[props.resource].singular);

  async function confirm() {
    const record = props.record;
    if (!record) return;
    try {
      await $fetch(`/api/${props.resource}/${record.id}`, { method: "DELETE" });
      useSonner(`${singular.value} deleted`, { description: `${record.label} was removed.` });
      emit("deleted");
    } catch (error) {
      useSonner.error(`Couldn't delete ${singular.value.toLowerCase()}`, {
        description: getErrorMessage(error),
      });
    }
  }
</script>
