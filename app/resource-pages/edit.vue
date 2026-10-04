<template>
  <AppErrorState v-if="error && !notFound" :what="meta.singular.toLowerCase()" @retry="refresh()" />
  <UiEmpty v-else-if="notFound" class="my-auto">
    <UiEmptyHeader>
      <UiEmptyMedia variant="icon"><Icon name="lucide:search-x" /></UiEmptyMedia>
      <UiEmptyTitle>{{ meta.singular }} not found</UiEmptyTitle>
      <UiEmptyDescription>It may have been deleted.</UiEmptyDescription>
    </UiEmptyHeader>
    <UiEmptyContent>
      <UiButton :to="meta.base">Back to {{ meta.plural.toLowerCase() }}</UiButton>
    </UiEmptyContent>
  </UiEmpty>
  <ResourceFormPage
    v-else
    :title="
      record ? `Edit ${getRecordLabel(resource, record)}` : `Edit ${meta.singular.toLowerCase()}`
    "
    :back-to="`${meta.base}/${id}`"
    back-label="Back to details"
  >
    <div v-if="!record" class="space-y-5">
      <UiSkeleton v-for="n in 5" :key="n" class="h-10 w-full" />
    </div>
    <component :is="Form" v-else :key="record.id" :record="record" />
  </ResourceFormPage>
</template>

<script lang="ts" setup>
  const route = useRoute();
  const resource = route.meta.resource as ResourceName;
  const meta = RESOURCES[resource];
  const id = route.params.id as string;
  const Form = useResourceView("Form", resource);

  const {
    data: record,
    error,
    refresh,
  } = useFetch<Record<string, any>>(`/api/${resource}/${id}`, {
    // A key of its own, so a page opened right after another (edit, then details) never reuses the
    // other's data and shows a stale record.
    key: `${resource}-${id}-${useId()}`,
    server: false,
  });
  const notFound = computed(
    () => (error.value as { statusCode?: number } | null)?.statusCode === 404
  );

  useSeoMeta({ title: `Edit ${meta.singular.toLowerCase()}` });
</script>
