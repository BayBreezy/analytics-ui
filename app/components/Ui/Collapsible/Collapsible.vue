<template>
  <CollapsibleRoot v-slot="slotProps" data-slot="collapsible" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </CollapsibleRoot>
</template>

<script lang="ts" setup>
  import { CollapsibleRoot, useForwardPropsEmits } from "reka-ui";
  import type { CollapsibleRootEmits, CollapsibleRootProps } from "reka-ui";

  const props = defineProps<CollapsibleRootProps>();

  const emit = defineEmits<CollapsibleRootEmits>();

  const forwarded = useForwardPropsEmits(props, emit);
</script>
