<template>
  <TooltipPortal data-slot="tooltip-portal" v-bind="props">
    <slot />
  </TooltipPortal>
</template>

<script lang="ts" setup>
  import { TooltipPortal } from "reka-ui";
  import type { TooltipPortalProps } from "reka-ui";

  const props = defineProps<TooltipPortalProps>();
</script>
