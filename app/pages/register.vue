<template>
  <div>
    <div class="text-center">
      <h1 class="text-2xl font-bold tracking-tight">Create your account</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink to="/login" class="font-semibold text-primary underline-offset-2 hover:underline">
          Sign in
        </NuxtLink>
      </p>
    </div>

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
          label="Full name"
          name="name"
          icon="lucide:user"
          placeholder="Jane Doe"
          autocomplete="name"
        />
        <UiVeeInput
          label="Email address"
          type="email"
          name="email"
          icon="lucide:mail"
          placeholder="you@example.com"
          autocomplete="email"
        />
        <UiVeePasswordInput
          label="Password"
          name="password"
          icon="lucide:lock"
          show-strength
          show-requirements
          :requirements="['length', 'number']"
          autocomplete="new-password"
        />
        <UiVeePasswordInput
          label="Confirm password"
          name="confirmPassword"
          icon="lucide:lock-keyhole"
          autocomplete="new-password"
        />
        <UiVeeCheckbox name="terms" label="I agree to the Terms of Service and Privacy Policy" />
        <UiButton type="submit" class="w-full" text="Create account" :loading="isSubmitting" />
      </fieldset>
    </form>

    <UiDivider class="my-6" label="Just exploring?" />
    <UiButton type="button" variant="outline" class="w-full" @click="fillDemo">
      <Icon name="lucide:wand-sparkles" />
      Fill demo data
    </UiButton>
  </div>
</template>

<script lang="ts" setup>
  import { toTypedSchema } from "@vee-validate/zod";

  definePageMeta({ layout: "auth", auth: "guest" });
  useSeoMeta({ title: "Create account", description: "Create a new Analytics account." });

  const { register } = useAuth();
  const formError = ref("");

  const { handleSubmit, isSubmitting, setValues } = useForm({
    validationSchema: toTypedSchema(registerSchema),
    initialValues: { terms: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
      await register(values);
      useSonner("Account created", { description: "Welcome to Analytics!" });
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });

  const fillDemo = () =>
    setValues({
      name: "Demo User",
      email: "demo@analytics.test",
      password: "password123",
      confirmPassword: "password123",
      terms: true,
    });
</script>
