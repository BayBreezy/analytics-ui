<template>
  <DialogClose data-slot="dialog-close" v-bind="props">
    <slot />
  </DialogClose>
</template>

<script lang="ts" setup>
  import { DialogClose } from "reka-ui";
  import type { DialogCloseProps } from "reka-ui";

  const props = defineProps<DialogCloseProps>();
</script>
