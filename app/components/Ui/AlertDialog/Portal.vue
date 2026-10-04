<template>
  <AlertDialogPortal data-slot="alert-dialog-portal" v-bind="props">
    <slot />
  </AlertDialogPortal>
</template>

<script lang="ts" setup>
  import { AlertDialogPortal } from "reka-ui";
  import type { AlertDialogPortalProps } from "reka-ui";

  const props = defineProps<AlertDialogPortalProps>();
</script>
