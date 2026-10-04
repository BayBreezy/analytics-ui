<template>
  <DialogRoot data-slot="dialog" v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>

<script lang="ts" setup>
  import { DialogRoot, useForwardPropsEmits } from "reka-ui";
  import type { DialogRootEmits, DialogRootProps } from "reka-ui";

  const props = defineProps<DialogRootProps>();
  const emit = defineEmits<DialogRootEmits>();
  const forwarded = useForwardPropsEmits(props, emit);
</script>
