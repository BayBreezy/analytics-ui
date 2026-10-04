<template>
  <UiBadge v-if="stock === 0" variant="error">Out of stock</UiBadge>
  <UiBadge v-else-if="stock < 20" variant="warning">Low: {{ stock }}</UiBadge>
  <span v-else class="text-sm">{{ formatNumber(stock) }}</span>
</template>

<script lang="ts" setup>
  defineProps<{ stock: number }>();
</script>
