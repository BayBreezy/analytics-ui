<template>
  <UiEmpty class="min-h-40 p-4">
    <UiEmptyHeader>
      <UiEmptyMedia variant="icon">
        <Icon name="lucide:triangle-alert" />
      </UiEmptyMedia>
      <UiEmptyTitle>Couldn't load {{ what }}</UiEmptyTitle>
      <UiEmptyDescription>Something went wrong. Please try again.</UiEmptyDescription>
    </UiEmptyHeader>
    <UiEmptyContent>
      <UiButton variant="outline" size="sm" @click="emit('retry')">
        <Icon name="lucide:refresh-cw" />
        Retry
      </UiButton>
    </UiEmptyContent>
  </UiEmpty>
</template>

<script lang="ts" setup>
  defineProps<{ what: string }>();
  const emit = defineEmits<{ retry: [] }>();
</script>
