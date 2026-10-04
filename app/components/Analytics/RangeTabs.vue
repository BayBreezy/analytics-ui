<template>
  <UiTabs v-model="range">
    <UiTabsList>
      <UiTabsTrigger v-for="option in RANGE_OPTIONS" :key="option.value" :value="option.value">
        <span class="sm:hidden">{{ option.short }}</span>
        <span class="hidden sm:inline">{{ option.label }}</span>
      </UiTabsTrigger>
    </UiTabsList>
  </UiTabs>
</template>

<script lang="ts" setup>
  const range = defineModel<SalesRange>({ required: true });
</script>
