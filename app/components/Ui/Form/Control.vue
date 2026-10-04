<template>
  <Slot
    :id="formItemId"
    :aria-describedby="!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`"
    :aria-invalid="!!error"
  >
    <slot :id="formItemId" />
  </Slot>
</template>

<script lang="ts" setup>
  import { Slot } from "reka-ui";

  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
</script>
