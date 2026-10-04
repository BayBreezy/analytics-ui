<template>
  <ResourceFormPage
    :title="`New ${meta.singular.toLowerCase()}`"
    :description="`Add a ${meta.singular.toLowerCase()} to your store.`"
    :back-to="meta.base"
    :back-label="`Back to ${meta.plural.toLowerCase()}`"
  >
    <component :is="Form" :key="resource" />
  </ResourceFormPage>
</template>

<script lang="ts" setup>
  const resource = useRoute().meta.resource as ResourceName;
  const meta = RESOURCES[resource];
  const Form = useResourceView("Form", resource);

  useSeoMeta({ title: `New ${meta.singular.toLowerCase()}` });
</script>
