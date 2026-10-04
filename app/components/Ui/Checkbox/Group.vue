<template>
  <CheckboxGroupRoot v-bind="forwarded">
    <slot />
  </CheckboxGroupRoot>
</template>

<script lang="ts">
  import { CheckboxGroupRoot, useForwardPropsEmits } from "reka-ui";
  import type { CheckboxGroupRootEmits, CheckboxGroupRootProps } from "reka-ui";
</script>

<script lang="ts" setup>
  const props = withDefaults(defineProps<CheckboxGroupRootProps>(), {
    loop: true,
    orientation: "horizontal",
  });

  const emit = defineEmits<CheckboxGroupRootEmits>();

  const forwarded = useForwardPropsEmits(props, emit);
</script>
