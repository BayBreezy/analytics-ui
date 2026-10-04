<template>
  <DropdownMenuRoot data-slot="dropdown-menu" v-bind="forwarded">
    <slot />
  </DropdownMenuRoot>
</template>

<script lang="ts" setup>
  import { DropdownMenuRoot, useForwardPropsEmits } from "reka-ui";
  import type { DropdownMenuRootEmits, DropdownMenuRootProps } from "reka-ui";

  const props = defineProps<DropdownMenuRootProps>();

  const emit = defineEmits<DropdownMenuRootEmits>();
  const forwarded = useForwardPropsEmits(props, emit);
</script>
