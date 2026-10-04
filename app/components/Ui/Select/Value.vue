<template>
  <SelectValue v-slot="slotProps" data-slot="select-value" v-bind="props">
    <slot v-bind="slotProps" />
  </SelectValue>
</template>

<script lang="ts" setup>
  import { SelectValue } from "reka-ui";
  import type { SelectValueProps } from "reka-ui";

  const props = defineProps<SelectValueProps>();
</script>
