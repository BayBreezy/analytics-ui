<template>
  <SelectGroup data-slot="select-group" v-bind="forwarded">
    <slot />
  </SelectGroup>
</template>

<script lang="ts" setup>
  import { SelectGroup, useForwardProps } from "reka-ui";
  import type { SelectGroupProps } from "reka-ui";

  const props = defineProps<SelectGroupProps>();
  const forwarded = useForwardProps(props);
</script>
