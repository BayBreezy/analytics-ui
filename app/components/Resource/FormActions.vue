<template>
  <div class="flex flex-wrap justify-end gap-2 pt-2">
    <UiButton variant="outline" :to="cancelTo">Cancel</UiButton>
    <UiButton type="submit" :loading="loading">{{ submitLabel }}</UiButton>
  </div>
</template>

<script lang="ts" setup>
  defineProps<{ cancelTo: string; submitLabel: string; loading?: boolean }>();
</script>
