<template>
  <div class="mx-auto w-full max-w-3xl space-y-6">
    <div>
      <NuxtLink
        :to="backTo"
        class="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon name="lucide:arrow-left" class="size-4" />
        {{ backLabel }}
      </NuxtLink>
      <h1 class="text-2xl font-bold tracking-tight">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <UiCard>
      <UiCardContent>
        <slot />
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
  defineProps<{
    title: string;
    description?: string;
    backTo: string;
    backLabel: string;
  }>();
</script>
