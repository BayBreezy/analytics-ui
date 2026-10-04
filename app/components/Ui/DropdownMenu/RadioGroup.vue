<template>
  <DropdownMenuRadioGroup data-slot="dropdown-menu-radio-group" v-bind="forwarded">
    <slot />
  </DropdownMenuRadioGroup>
</template>

<script lang="ts" setup>
  import { DropdownMenuRadioGroup, useForwardPropsEmits } from "reka-ui";
  import type { DropdownMenuRadioGroupEmits, DropdownMenuRadioGroupProps } from "reka-ui";

  const props = defineProps<DropdownMenuRadioGroupProps>();

  const emits = defineEmits<DropdownMenuRadioGroupEmits>();

  const forwarded = useForwardPropsEmits(props, emits);
</script>
