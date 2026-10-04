<template>
  <UiTooltipProvider v-bind="props">
    <TooltipRoot v-slot="slotProps" data-slot="tooltip" v-bind="{ ...forwarded, ...$attrs }">
      <slot v-bind="slotProps">
        <slot v-bind="slotProps" name="trigger" />
        <slot v-bind="slotProps" name="content" />
      </slot>
    </TooltipRoot>
  </UiTooltipProvider>
</template>

<script lang="ts" setup>
  import { TooltipRoot, useForwardPropsEmits } from "reka-ui";
  import type { TooltipProviderProps, TooltipRootEmits, TooltipRootProps } from "reka-ui";

  defineOptions({ inheritAttrs: false });

  const props = withDefaults(defineProps<TooltipRootProps & TooltipProviderProps>(), {
    delayDuration: 0,
  });

  const emits = defineEmits<TooltipRootEmits>();

  const forwarded = useForwardPropsEmits(props, emits);
</script>
