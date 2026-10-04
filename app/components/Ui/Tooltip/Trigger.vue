<template>
  <TooltipTrigger data-slot="tooltip-trigger" v-bind="props">
    <slot />
  </TooltipTrigger>
</template>

<script lang="ts" setup>
  import { TooltipTrigger } from "reka-ui";
  import type { TooltipTriggerProps } from "reka-ui";

  const props = defineProps<TooltipTriggerProps>();
</script>
