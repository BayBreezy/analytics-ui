<template>
  <SelectPortal data-slot="select-portal" v-bind="props">
    <slot />
  </SelectPortal>
</template>

<script lang="ts" setup>
  import { SelectPortal } from "reka-ui";
  import type { SelectPortalProps } from "reka-ui";

  const props = defineProps<SelectPortalProps>();
</script>
