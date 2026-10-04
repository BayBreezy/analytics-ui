<template>
  <DialogPortal data-slot="dialog-portal" v-bind="props">
    <slot />
  </DialogPortal>
</template>

<script lang="ts" setup>
  import { DialogPortal } from "reka-ui";
  import type { DialogPortalProps } from "reka-ui";

  const props = defineProps<DialogPortalProps>();
</script>
