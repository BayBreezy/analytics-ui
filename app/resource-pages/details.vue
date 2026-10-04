<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <NuxtLink
          :to="meta.base"
          class="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="size-4" />
          Back to {{ meta.plural.toLowerCase() }}
        </NuxtLink>
        <h1 class="truncate text-2xl font-bold tracking-tight">
          <UiSkeleton v-if="!record && !error" class="h-8 w-56" />
          <template v-else>{{
            record ? getRecordLabel(resource, record) : meta.singular
          }}</template>
        </h1>
      </div>
      <div v-if="record" class="flex gap-2">
        <UiButton variant="outline" :to="`${meta.base}/${id}/edit`">
          <Icon name="lucide:pencil" />
          Edit
        </UiButton>
        <UiButton
          variant="outline"
          class="text-destructive hover:text-destructive"
          @click="deleting = true"
        >
          <Icon name="lucide:trash-2" />
          Delete
        </UiButton>
      </div>
    </div>

    <UiEmpty v-if="notFound">
      <UiEmptyHeader>
        <UiEmptyMedia variant="icon"><Icon name="lucide:search-x" /></UiEmptyMedia>
        <UiEmptyTitle>{{ meta.singular }} not found</UiEmptyTitle>
        <UiEmptyDescription>It may have been deleted.</UiEmptyDescription>
      </UiEmptyHeader>
      <UiEmptyContent>
        <UiButton :to="meta.base">Back to {{ meta.plural.toLowerCase() }}</UiButton>
      </UiEmptyContent>
    </UiEmpty>
    <AppErrorState v-else-if="error" :what="meta.singular.toLowerCase()" @retry="refresh()" />
    <div v-else-if="!record" class="grid gap-6 lg:grid-cols-3">
      <UiSkeleton class="h-64 lg:col-span-2" />
      <UiSkeleton class="h-64" />
    </div>
    <component :is="Details" v-else :key="record.id" :record="record" @changed="refresh()" />

    <ResourceDeleteDialog
      :resource="resource"
      :record="deleting && record ? { id, label: getRecordLabel(resource, record) } : null"
      @close="deleting = false"
      @deleted="navigateTo(meta.base)"
    />
  </div>
</template>

<script lang="ts" setup>
  const route = useRoute();
  const resource = route.meta.resource as ResourceName;
  const meta = RESOURCES[resource];
  const id = route.params.id as string;
  const Details = useResourceView("Details", resource);

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
  const deleting = ref(false);

  useSeoMeta({
    title: () => (record.value ? getRecordLabel(resource, record.value) : meta.singular),
  });
</script>
