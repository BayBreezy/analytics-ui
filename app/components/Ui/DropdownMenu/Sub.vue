<template>
  <DropdownMenuSub data-slot="dropdown-menu-sub" v-bind="forwarded">
    <slot />
  </DropdownMenuSub>
</template>

<script lang="ts" setup>
  import { DropdownMenuSub, useForwardPropsEmits } from "reka-ui";
  import type { DropdownMenuSubEmits, DropdownMenuSubProps } from "reka-ui";

  const props = defineProps<DropdownMenuSubProps>();
  const emits = defineEmits<DropdownMenuSubEmits>();
  const forwarded = useForwardPropsEmits(props, emits);
</script>
