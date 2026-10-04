<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Notifications</UiCardTitle>
      <UiCardDescription>
        Choose what you hear about. This is a demo: the choices are saved, but no emails are sent.
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <UiAlert
        v-if="formError"
        variant="destructive"
        icon="lucide:circle-alert"
        :description="formError"
        class="mb-5"
      />
      <div class="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 gap-y-4">
        <span />
        <span class="w-14 text-center text-xs font-medium text-muted-foreground uppercase">
          Email
        </span>
        <span class="w-14 text-center text-xs font-medium text-muted-foreground uppercase">
          In-app
        </span>
        <template v-for="event in NOTIFICATION_EVENTS" :key="event.id">
          <div class="min-w-0">
            <p class="text-sm font-medium">{{ event.label }}</p>
            <p class="text-xs text-muted-foreground">{{ event.description }}</p>
          </div>
          <div class="flex w-14 justify-center">
            <UiSwitch
              :model-value="draft[event.id].email"
              :aria-label="`${event.label} by email`"
              :disabled="saving"
              @update:model-value="draft[event.id].email = $event"
            />
          </div>
          <div class="flex w-14 justify-center">
            <UiSwitch
              :model-value="draft[event.id].inApp"
              :aria-label="`${event.label} in the app`"
              :disabled="saving"
              @update:model-value="draft[event.id].inApp = $event"
            />
          </div>
        </template>
      </div>
      <div class="mt-6 flex flex-wrap justify-end gap-2">
        <UiButton variant="outline" :disabled="!dirty || saving" @click="onReset">Reset</UiButton>
        <UiButton :loading="saving" :disabled="!dirty" @click="onSave">Save changes</UiButton>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const props = defineProps<{ settings: Settings }>();
  const { save } = useSettings();

  const copy = () => structuredClone(toRaw(props.settings.notifications));
  const draft = ref(copy());
  const formError = ref("");
  const saving = ref(false);

  const dirty = computed(
    () => JSON.stringify(draft.value) !== JSON.stringify(props.settings.notifications)
  );

  const onReset = () => {
    formError.value = "";
    draft.value = copy();
  };

  async function onSave() {
    formError.value = "";
    saving.value = true;
    try {
      await save({ notifications: draft.value });
      useSonner("Notification settings saved");
    } catch (error) {
      formError.value = getErrorMessage(error);
    } finally {
      saving.value = false;
    }
  }
</script>
