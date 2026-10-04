<template>
  <AlertDialogTrigger data-slot="alert-dialog-trigger" v-bind="props">
    <slot />
  </AlertDialogTrigger>
</template>

<script lang="ts" setup>
  import { AlertDialogTrigger } from "reka-ui";
  import type { AlertDialogTriggerProps } from "reka-ui";

  const props = defineProps<AlertDialogTriggerProps>();
</script>
