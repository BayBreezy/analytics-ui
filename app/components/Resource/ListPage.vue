<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ meta.plural }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          <template v-if="list.data.value"
            >{{ formatNumber(list.data.value.total) }} in total</template
          >
          <template v-else>&nbsp;</template>
        </p>
      </div>
      <UiButton v-if="canWrite" :to="`${meta.base}/create`">
        <Icon name="lucide:plus" />
        New {{ meta.singular.toLowerCase() }}
      </UiButton>
    </div>

    <UiCard class="gap-0 overflow-hidden py-0">
      <div class="flex flex-wrap items-center gap-3 border-b p-4">
        <div class="relative w-full sm:w-72">
          <Icon
            name="lucide:search"
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/70"
          />
          <UiInput
            v-model="list.searchInput.value"
            class="pl-9"
            type="search"
            :placeholder="searchPlaceholder ?? `Search ${meta.plural.toLowerCase()}`"
            :aria-label="`Search ${meta.plural.toLowerCase()}`"
          />
        </div>
        <template v-for="filter in filters" :key="filter.key">
          <UiNativeSelect
            v-if="!filter.hidden"
            :model-value="list.filters.value[filter.key]"
            class="w-full sm:w-44"
            :aria-label="filter.label"
            @update:model-value="list.setFilter(filter.key, String($event))"
          >
            <option value="">{{ filter.label }}</option>
            <option v-for="option in filter.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </UiNativeSelect>
          <!-- A filter with no control of its own, set by a link (e.g. "View all" on a customer). -->
          <UiBadge
            v-else-if="list.filters.value[filter.key]"
            variant="secondary"
            size="md"
            class="gap-1.5"
          >
            {{ filter.label }}
            <button
              type="button"
              class="-mr-1 rounded-sm hover:text-foreground"
              :aria-label="`Remove ${filter.label} filter`"
              @click="list.setFilter(filter.key, '')"
            >
              <Icon name="lucide:x" class="size-3.5" />
            </button>
          </UiBadge>
        </template>
        <UiButton
          v-if="list.hasFilters.value"
          variant="ghost"
          size="sm"
          @click="list.clearFilters()"
        >
          <Icon name="lucide:x" />
          Clear
        </UiButton>
      </div>

      <AppErrorState
        v-if="list.error.value && !list.data.value"
        :what="meta.plural.toLowerCase()"
        class="py-10"
        @retry="list.refresh()"
      />
      <div v-else-if="!list.data.value" class="space-y-4 p-6">
        <div v-for="n in 8" :key="n" class="flex items-center gap-4">
          <UiSkeleton class="size-10 rounded-full" />
          <UiSkeleton class="h-4 flex-1" />
          <UiSkeleton class="h-4 w-24" />
        </div>
      </div>
      <template v-else>
        <UiTanStackTable
          ref="tableRef"
          :data="list.data.value.items"
          :columns="allColumns"
          :loading="list.pending.value"
          manual-sorting
          :show-footer="false"
          :initial-page-size="100"
          :table-options="{ enableRowPinning: false }"
          class="border-0"
          @update:sorting="onSorting"
        >
          <template v-for="name in cellSlots" :key="name" #[name]="scope">
            <slot :name="name" v-bind="scope" />
          </template>
          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <ResourceRowActions
                :resource="resource"
                :id="row.original.id"
                :label="getRecordLabel(resource, row.original)"
                @delete="
                  deleting = { id: row.original.id, label: getRecordLabel(resource, row.original) }
                "
              />
            </div>
          </template>
          <template #empty>
            <UiEmpty class="min-h-48 p-6">
              <UiEmptyHeader>
                <UiEmptyMedia variant="icon">
                  <Icon :name="meta.icon" />
                </UiEmptyMedia>
                <UiEmptyTitle>
                  {{ list.hasFilters.value ? "No matches" : `No ${meta.plural.toLowerCase()} yet` }}
                </UiEmptyTitle>
                <UiEmptyDescription>
                  {{
                    list.hasFilters.value
                      ? "Try a different search or clear the filters."
                      : canWrite
                        ? `Create the first ${meta.singular.toLowerCase()} to get started.`
                        : `There are no ${meta.plural.toLowerCase()} to show.`
                  }}
                </UiEmptyDescription>
              </UiEmptyHeader>
              <UiEmptyContent>
                <UiButton
                  v-if="list.hasFilters.value"
                  variant="outline"
                  @click="list.clearFilters()"
                >
                  Clear filters
                </UiButton>
                <UiButton v-else-if="canWrite" :to="`${meta.base}/create`">
                  <Icon name="lucide:plus" />
                  New {{ meta.singular.toLowerCase() }}
                </UiButton>
              </UiEmptyContent>
            </UiEmpty>
          </template>
        </UiTanStackTable>
        <ResourcePagination
          :page="list.data.value.page"
          :page-size="list.data.value.pageSize"
          :page-count="list.data.value.pageCount"
          :total="list.data.value.total"
          @update:page="list.setPage"
          @update:page-size="list.setPageSize"
        />
      </template>
    </UiCard>

    <ResourceDeleteDialog
      :resource="resource"
      :record="deleting"
      @close="deleting = null"
      @deleted="onDeleted"
    />
  </div>
</template>

<script lang="ts" setup>
  import type { ColumnDef, SortingState } from "@tanstack/vue-table";
  import type { TanStackTableFeatures } from "~/components/Ui/TanStackTable.vue";

  export interface ListFilter {
    key: string;
    /** Shown as the "all" option, e.g. "All statuses". */
    label: string;
    options: { value: string; label: string }[];
    /** No dropdown. The filter is only set through the URL, and shows as a removable chip. */
    hidden?: boolean;
  }

  const props = defineProps<{
    resource: ResourceName;
    columns: ColumnDef<TanStackTableFeatures, any>[];
    filters?: ListFilter[];
    searchPlaceholder?: string;
  }>();

  const slots = useSlots();
  const meta = computed(() => RESOURCES[props.resource]);
  const { canWrite } = useResourcePermissions(() => props.resource);
  const list = useResourceList(
    props.resource,
    (props.filters ?? []).map((filter) => filter.key)
  );

  // The per-resource list supplies the data columns and their cell slots. The row actions column is
  // added here so it is the same everywhere.
  const allColumns = computed(() => [
    ...props.columns,
    { id: "actions", header: "", enableSorting: false } as ColumnDef<TanStackTableFeatures, any>,
  ]);
  const cellSlots = computed(() => Object.keys(slots).filter((name) => name.endsWith("-cell")));

  // The server does the sorting. The table only shows the arrow, kept in step with the URL.
  const tableRef = ref<any>(null);
  function syncSorting() {
    if (!tableRef.value) return;
    const next = list.sort.value
      ? [{ id: list.sort.value, desc: list.order.value === "desc" }]
      : [];
    if (JSON.stringify(tableRef.value.sorting) !== JSON.stringify(next))
      tableRef.value.sorting = next;
  }
  watch([tableRef, list.sort, list.order], syncSorting, { immediate: true, flush: "post" });

  function onSorting(sorting: SortingState) {
    const [first] = sorting;
    if (first) list.setSort(first.id, first.desc ? "desc" : "asc");
    else list.setSort();
  }

  const deleting = ref<{ id: string; label: string } | null>(null);
  function onDeleted() {
    deleting.value = null;
    // Deleting the last row of a page would leave an empty page, so step back.
    const remaining = list.data.value?.items.length ?? 0;
    if (remaining <= 1 && list.page.value > 1) list.setPage(list.page.value - 1);
    else list.refresh();
  }
</script>
