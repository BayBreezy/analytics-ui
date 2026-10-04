<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
    <div class="absolute top-4 right-4">
      <ColorModeToggle />
    </div>

    <div class="w-full max-w-md">
      <NuxtLink to="/" class="mb-8 flex items-center justify-center gap-2.5">
        <span class="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Icon name="lucide:chart-column" class="size-5" />
        </span>
        <span class="text-xl font-semibold tracking-tight">Analytics</span>
      </NuxtLink>

      <UiCard>
        <UiCardContent class="p-6 sm:p-8">
          <slot />
        </UiCardContent>
      </UiCard>

      <p class="mt-6 text-center text-xs text-muted-foreground">
        Demo app. No real accounts are created and no email is sent.
      </p>
    </div>
  </div>
</template>
