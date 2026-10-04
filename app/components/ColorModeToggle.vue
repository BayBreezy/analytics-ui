<template>
  <UiButton
    variant="ghost"
    size="icon"
    aria-label="Toggle color mode"
    @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
  >
    <Icon name="lucide:moon" class="dark:hidden" />
    <Icon name="lucide:sun" class="hidden dark:block" />
  </UiButton>
</template>

<script lang="ts" setup>
  const colorMode = useColorMode();
</script>
