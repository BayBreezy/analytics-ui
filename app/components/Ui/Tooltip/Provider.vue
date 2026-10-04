<template>
  <TooltipProvider data-slot="tooltip-provider" v-bind="props">
    <slot />
  </TooltipProvider>
</template>

<script lang="ts" setup>
  import { TooltipProvider } from "reka-ui";
  import type { TooltipProviderProps } from "reka-ui";

  const props = withDefaults(defineProps<TooltipProviderProps>(), {
    delayDuration: 0,
  });
</script>
