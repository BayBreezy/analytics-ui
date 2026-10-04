<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
    <div class="absolute top-4 right-4">
      <ColorModeToggle />
    </div>

    <main class="w-full max-w-md text-center">
      <UiFancyIcon
        :icon="isNotFound ? 'lucide:map-pin-off' : 'lucide:triangle-alert'"
        theme="gradient"
        :color="isNotFound ? 'primary' : 'error'"
        size="xl"
        class="mx-auto"
      />
      <p class="mt-6 text-sm font-semibold text-muted-foreground">{{ status }}</p>
      <h1 class="mt-1 text-3xl font-bold tracking-tight">{{ title }}</h1>
      <p class="mt-3 text-sm text-muted-foreground">{{ description }}</p>
      <p
        v-if="!isNotFound && showDetails"
        class="mx-auto mt-4 max-w-full rounded-md bg-muted p-3 text-left font-mono text-xs wrap-break-word"
      >
        {{ error.message }}
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UiButton @click="goHome">
          <Icon :name="isLoggedIn ? 'lucide:layout-dashboard' : 'lucide:log-in'" />
          {{ isLoggedIn ? "Back to dashboard" : "Go to sign in" }}
        </UiButton>
        <UiButton v-if="!isNotFound" variant="outline" @click="retry">
          <Icon name="lucide:refresh-cw" />
          Try again
        </UiButton>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
  import type { NuxtError } from "#app";

  const props = defineProps<{ error: NuxtError }>();

  const { isLoggedIn } = useAuth();
  const route = useRoute();

  const status = computed(() => props.error.statusCode ?? 500);
  const isNotFound = computed(() => status.value === 404);
  const title = computed(() => (isNotFound.value ? "Page not found" : "Something went wrong"));
  const description = computed(() =>
    isNotFound.value
      ? "The page you're looking for doesn't exist, or it has moved."
      : "An unexpected error stopped this page from loading. Try again, or go back to the start."
  );
  // The technical message is for developers. Visitors only see the friendly text.
  const showDetails = import.meta.dev;

  useSeoMeta({ title: () => `${title.value} · Analytics` });

  const goHome = () => clearError({ redirect: isLoggedIn.value ? DASHBOARD_URL : "/login" });
  const retry = () => clearError({ redirect: route.fullPath });
</script>
