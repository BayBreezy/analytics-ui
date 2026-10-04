<template>
  <SelectItemText data-slot="select-item-text" v-bind="props">
    <slot />
  </SelectItemText>
</template>

<script lang="ts" setup>
  import { SelectItemText } from "reka-ui";
  import type { SelectItemTextProps } from "reka-ui";

  const props = defineProps<SelectItemTextProps>();
</script>
