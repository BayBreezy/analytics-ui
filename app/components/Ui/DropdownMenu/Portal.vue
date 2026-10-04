<template>
  <DropdownMenuPortal data-slot="dropdown-menu-portal" v-bind="props">
    <slot />
  </DropdownMenuPortal>
</template>

<script lang="ts" setup>
  import { DropdownMenuPortal } from "reka-ui";
  import type { DropdownMenuPortalProps } from "reka-ui";

  const props = defineProps<DropdownMenuPortalProps>();
</script>
