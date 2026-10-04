<template>
  <ScrollAreaCorner data-slot="scroll-area-corner" v-bind="props">
    <slot />
  </ScrollAreaCorner>
</template>

<script lang="ts" setup>
  import { ScrollAreaCorner } from "reka-ui";
  import type { ScrollAreaCornerProps } from "reka-ui";

  const props = defineProps<ScrollAreaCornerProps>();
</script>
