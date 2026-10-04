<template>
  <component :is="View" :key="resource" />
</template>

<script lang="ts" setup>
  // Registered for every resource by the `pages:extend` hook in nuxt.config.ts.
  const resource = useRoute().meta.resource as ResourceName;
  const View = useResourceView("List", resource);

  useSeoMeta({ title: RESOURCES[resource].plural });
</script>
