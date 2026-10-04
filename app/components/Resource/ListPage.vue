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
      <div class="flex flex-wrap items-center gap-2">
        <UiButton
          v-if="list.data.value?.total"
          as="a"
          variant="outline"
          :href="exportUrl"
          :aria-label="`Export ${formatNumber(list.data.value.total)} ${meta.plural.toLowerCase()} as CSV`"
        >
          <Icon name="lucide:download" />
          Export CSV
        </UiButton>
        <UiButton v-if="canWrite" :to="`${meta.base}/create`">
          <Icon name="lucide:plus" />
          New {{ meta.singular.toLowerCase() }}
        </UiButton>
      </div>
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

      <div
        v-if="canWrite && selectedIds.length"
        role="status"
        class="flex flex-wrap items-center gap-3 border-b bg-muted/40 px-4 py-2"
      >
        <p class="text-sm font-medium">
          {{ formatNumber(selectedIds.length) }} selected
          <span class="font-normal text-muted-foreground">on this page</span>
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <UiButton variant="outline" size="sm" :disabled="bulkBusy">
                Set status
                <Icon name="lucide:chevron-down" />
              </UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="start">
              <UiDropdownMenuItem
                v-for="status in RESOURCE_STATUSES[resource]"
                :key="status"
                class="capitalize"
                @select="bulkUpdate(status)"
              >
                {{ status }}
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
          <UiButton
            variant="outline"
            size="sm"
            class="text-destructive hover:text-destructive"
            :disabled="bulkBusy"
            @click="confirmingBulkDelete = true"
          >
            <Icon name="lucide:trash-2" />
            Delete
          </UiButton>
          <UiButton variant="ghost" size="sm" :disabled="bulkBusy" @click="clearSelection">
            Clear
          </UiButton>
        </div>
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
          :table-options="tableOptions"
          class="border-0"
          @update:sorting="onSorting"
        >
          <template v-for="name in cellSlots" :key="name" #[name]="scope">
            <slot :name="name" v-bind="scope" />
          </template>
          <template #select-header="{ table }">
            <UiCheckbox
              :model-value="
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              "
              aria-label="Select all on this page"
              @update:model-value="table.toggleAllPageRowsSelected(Boolean($event))"
            />
          </template>
          <template #select-cell="{ row }">
            <UiCheckbox
              :model-value="row.getIsSelected()"
              :aria-label="`Select ${getRecordLabel(resource, row.original)}`"
              @update:model-value="row.toggleSelected(Boolean($event))"
            />
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

    <AppConfirmDialog
      :open="confirmingBulkDelete"
      :title="`Delete ${selectedIds.length} ${(selectedIds.length === 1 ? meta.singular : meta.plural).toLowerCase()}?`"
      description="They will be removed for good. This can't be undone."
      confirm-label="Delete"
      destructive
      @close="confirmingBulkDelete = false"
      @confirm="bulkDelete"
    />

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
    // A checkbox column, for people who may change records.
    ...(canWrite.value
      ? [
          {
            id: "select",
            header: "",
            enableSorting: false,
            meta: { class: { th: "w-10", td: "w-10" } },
          } as ColumnDef<TanStackTableFeatures, any>,
        ]
      : []),
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

  // Exports everything that matches the search and filters now showing, not just this page.
  const exportUrl = computed(() => {
    const { page: _page, pageSize: _pageSize, ...rest } = list.apiQuery.value;
    const params = new URLSearchParams(rest as Record<string, string>);
    return `/api/${props.resource}/export?${params}`;
  });

  // ---- Selecting rows and changing them together
  const tableOptions = {
    enableRowPinning: false,
    enableRowSelection: true,
    // Selected rows are tracked by record id, not by position.
    getRowId: (row: any) => String(row.id),
  };
  const selectedIds = computed(() =>
    Object.entries((tableRef.value?.rowSelection ?? {}) as Record<string, boolean>)
      .filter(([, selected]) => selected)
      .map(([id]) => id)
  );
  const clearSelection = () => {
    if (tableRef.value) tableRef.value.rowSelection = {};
  };
  // A different page, search, filter, sort or fresh data means a different set of rows.
  watch(() => list.data.value, clearSelection);

  const bulkBusy = ref(false);
  const confirmingBulkDelete = ref(false);

  async function bulk(body: { action: "delete" | "update"; status?: string }) {
    const ids = selectedIds.value;
    bulkBusy.value = true;
    try {
      const result = await $fetch<BulkResult>(`/api/${props.resource}/bulk` as string, {
        method: "POST",
        body: { ...body, ids },
      });
      const noun = (count: number) =>
        `${formatNumber(count)} ${(count === 1 ? meta.value.singular : meta.value.plural).toLowerCase()}`;
      const verb = body.action === "delete" ? "Deleted" : "Updated";
      if (!result.failed.length) {
        useSonner(`${verb} ${noun(result.done)}`);
      } else {
        const reasons = [...new Set(result.failed.map((item) => item.message))].slice(0, 3);
        const options = { description: reasons.join(" ") };
        if (result.done) {
          useSonner.warning(`${verb} ${result.done} of ${ids.length}`, options);
        } else {
          useSonner.error(
            `Couldn't ${body.action === "delete" ? "delete" : "update"} any`,
            options
          );
        }
      }
      clearSelection();
      // Deleting every row of the last page would leave an empty page, so step back.
      if (body.action === "delete" && result.done >= (list.data.value?.items.length ?? 0)) {
        if (list.page.value > 1) return list.setPage(list.page.value - 1);
      }
      await list.refresh();
    } catch (error) {
      useSonner.error("Couldn't change the selected rows", { description: getErrorMessage(error) });
    } finally {
      bulkBusy.value = false;
    }
  }

  const bulkUpdate = (status: string) => bulk({ action: "update", status });
  const bulkDelete = () => {
    confirmingBulkDelete.value = false;
    return bulk({ action: "delete" });
  };

  const deleting = ref<{ id: string; label: string } | null>(null);
  function onDeleted() {
    deleting.value = null;
    // Deleting the last row of a page would leave an empty page, so step back.
    const remaining = list.data.value?.items.length ?? 0;
    if (remaining <= 1 && list.page.value > 1) list.setPage(list.page.value - 1);
    else list.refresh();
  }
</script>
