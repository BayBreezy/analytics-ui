<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Password</UiCardTitle>
      <UiCardDescription>
        Choose a password you don't use anywhere else. Demo accounts have no real password, so any
        current password works.
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
      <form novalidate @submit="onSubmit">
        <fieldset :disabled="isSubmitting" class="grid gap-5">
          <UiVeePasswordInput
            label="Current password"
            name="currentPassword"
            icon="lucide:lock"
            autocomplete="current-password"
          />
          <div class="grid gap-5 sm:grid-cols-2">
            <UiVeePasswordInput
              label="New password"
              name="newPassword"
              icon="lucide:lock-keyhole"
              show-strength
              show-requirements
              :requirements="['length', 'number']"
              autocomplete="new-password"
            />
            <UiVeePasswordInput
              label="Confirm new password"
              name="confirmPassword"
              icon="lucide:lock-keyhole"
              autocomplete="new-password"
            />
          </div>
          <div class="flex justify-end">
            <UiButton type="submit" :loading="isSubmitting">Update password</UiButton>
          </div>
        </fieldset>
      </form>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  import { toTypedSchema } from "@vee-validate/zod";

  const formError = ref("");

  const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: toTypedSchema(changePasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
      await $fetch("/api/account/password", { method: "POST", body: values });
      resetForm();
      useSonner("Password updated");
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });
</script>
