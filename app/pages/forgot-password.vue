<template>
  <div>
    <div class="text-center">
      <h1 class="text-2xl font-bold tracking-tight">Forgot your password?</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Enter your email and we'll send you a link to reset it.
      </p>
    </div>

    <UiAlert
      v-if="successMessage"
      variant="success"
      icon="lucide:circle-check"
      :description="successMessage"
      class="mt-6"
    />
    <UiAlert
      v-if="formError"
      variant="destructive"
      icon="lucide:circle-alert"
      :description="formError"
      class="mt-6"
    />

    <form class="mt-6" novalidate @submit="onSubmit">
      <fieldset :disabled="isSubmitting" class="grid gap-5">
        <UiVeeInput
          label="Email address"
          type="email"
          name="email"
          icon="lucide:mail"
          placeholder="you@example.com"
          autocomplete="email"
        />
        <UiButton
          type="submit"
          class="w-full"
          :text="successMessage ? 'Resend link' : 'Send reset link'"
          :loading="isSubmitting"
        />
      </fieldset>
    </form>

    <NuxtLink
      to="/login"
      class="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon name="lucide:arrow-left" class="size-4" />
      Back to sign in
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
  import { toTypedSchema } from "@vee-validate/zod";

  definePageMeta({ layout: "auth", auth: "guest" });
  useSeoMeta({ title: "Forgot password", description: "Reset your Analytics password." });

  const { forgotPassword } = useAuth();
  const formError = ref("");
  const successMessage = ref("");

  const { handleSubmit, isSubmitting } = useForm({
    validationSchema: toTypedSchema(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    successMessage.value = "";
    try {
      const response = await forgotPassword(values);
      successMessage.value = response.message;
      useSonner("Check your inbox", { description: response.message });
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });
</script>
