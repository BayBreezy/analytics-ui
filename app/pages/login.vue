<template>
  <div>
    <div class="text-center">
      <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        New here?
        <NuxtLink
          to="/register"
          class="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Create an account
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
          placeholder="••••••••"
          autocomplete="current-password"
        />
        <div class="flex items-center justify-between">
          <UiVeeCheckbox label="Remember me" name="remember" />
          <NuxtLink
            to="/forgot-password"
            class="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Forgot password?
          </NuxtLink>
        </div>
        <UiButton type="submit" class="w-full" text="Sign in" :loading="isSubmitting" />
      </fieldset>
    </form>

    <UiDivider class="my-6" label="Just exploring?" />
    <UiButton type="button" variant="outline" class="w-full" @click="fillDemo">
      <Icon name="lucide:wand-sparkles" />
      Fill demo credentials
    </UiButton>
  </div>
</template>

<script lang="ts" setup>
  import { toTypedSchema } from "@vee-validate/zod";

  definePageMeta({ layout: "auth", auth: "guest" });
  useSeoMeta({ title: "Sign in", description: "Sign in to your Analytics account." });

  const { login } = useAuth();
  const formError = ref("");

  const { handleSubmit, isSubmitting, setValues } = useForm({
    validationSchema: toTypedSchema(loginSchema),
    initialValues: { remember: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
      await login(values);
      useSonner("Signed in", { description: "Welcome back!" });
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });

  const fillDemo = () => setValues({ email: "demo@analytics.test", password: "password123" });
</script>
