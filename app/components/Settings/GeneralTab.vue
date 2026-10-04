<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>General</UiCardTitle>
      <UiCardDescription>Your store's name and where customers can reach you.</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <UiAlert
        v-if="formError"
        variant="destructive"
        icon="lucide:circle-alert"
        :description="formError"
        class="mb-5"
      />
      <form novalidate @submit="onSubmit">
        <fieldset :disabled="isSubmitting" class="grid gap-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <UiVeeInput
              label="Store name"
              name="storeName"
              hint="Shown in the sidebar and in the browser tab."
              required
            />
            <UiVeeInput
              label="Support email"
              name="supportEmail"
              type="email"
              placeholder="support@example.com"
              required
            />
            <UiVeeSelect label="Timezone" name="timezone" required>
              <option v-for="zone in TIMEZONES" :key="zone" :value="zone">
                {{ zone.replaceAll("_", " ") }}
              </option>
            </UiVeeSelect>
          </div>
          <div class="flex flex-wrap justify-end gap-2">
            <UiButton type="button" variant="outline" :disabled="!meta.dirty" @click="onReset">
              Reset
            </UiButton>
            <UiButton type="submit" :loading="isSubmitting" :disabled="!meta.dirty">
              Save changes
            </UiButton>
          </div>
        </fieldset>
      </form>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  import { toTypedSchema } from "@vee-validate/zod";

  const props = defineProps<{ settings: Settings }>();
  const { save } = useSettings();

  const formError = ref("");
  const general = () => ({
    storeName: props.settings.storeName,
    supportEmail: props.settings.supportEmail,
    timezone: props.settings.timezone as SettingsInput["timezone"],
  });

  const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
    // Only these three fields are on this tab. The notifications are edited on their own tab.
    validationSchema: toTypedSchema(settingsSchema.omit({ notifications: true })),
    initialValues: general(),
  });

  const onReset = () => {
    formError.value = "";
    resetForm({ values: general() });
  };

  const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
      const saved = await save(values);
      resetForm({ values: { ...values, timezone: saved.timezone as SettingsInput["timezone"] } });
      useSonner("Settings saved");
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });
</script>
