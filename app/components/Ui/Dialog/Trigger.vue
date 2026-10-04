<template>
  <DialogTrigger data-slot="dialog-trigger" v-bind="props">
    <slot />
  </DialogTrigger>
</template>

<script lang="ts" setup>
  import { DialogTrigger } from "reka-ui";
  import type { DialogTriggerProps } from "reka-ui";

  const props = defineProps<DialogTriggerProps>();
</script>
