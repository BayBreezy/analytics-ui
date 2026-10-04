<template>
  <UiCard class="gap-0 overflow-hidden pb-0">
    <UiCardHeader class="border-b pb-4">
      <UiCardTitle>Recent orders</UiCardTitle>
      <UiCardDescription>The latest orders placed in your store</UiCardDescription>
      <UiCardAction>
        <UiButton variant="outline" size="sm" to="/orders">View all</UiButton>
      </UiCardAction>
    </UiCardHeader>
    <AppErrorState v-if="error" what="orders" class="py-6" @retry="refresh()" />
    <div v-else-if="!data" class="space-y-4 p-6">
      <div v-for="n in 6" :key="n" class="flex items-center gap-4">
        <UiSkeleton class="size-10 rounded-full" />
        <UiSkeleton class="h-4 flex-1" />
        <UiSkeleton class="h-4 w-20" />
      </div>
    </div>
    <UiTanStackTable
      v-else
      :data="data"
      :columns="columns"
      :show-footer="false"
      :initial-page-size="6"
      :table-options="{ enableRowPinning: false }"
      class="border-0"
    >
      <template #customer-cell="{ row }">
        <UiAvatarLabelGroup
          size="sm"
          :src="row.original.customer.avatar"
          :alt="row.original.customer.name"
          :fallback="initialsOf(row.original.customer.name)"
          :title="row.original.customer.name"
          :subtitle="row.original.number"
        />
      </template>
      <template #items-cell="{ row }">
        <span>{{ row.original.items[0]?.name }}</span>
        <span v-if="row.original.items.length > 1" class="text-muted-foreground">
          +{{ row.original.items.length - 1 }} more
        </span>
      </template>
      <template #status-cell="{ row }">
        <UiBadge :variant="ORDER_STATUS_VARIANTS[row.original.status]" class="capitalize">
          {{ row.original.status }}
        </UiBadge>
      </template>
      <template #total-cell="{ row }">
        <span class="font-medium">{{ formatCurrency(row.original.total) }}</span>
      </template>
      <template #createdAt-cell="{ row }">
        <span class="text-muted-foreground">{{ formatRelative(row.original.createdAt) }}</span>
      </template>
    </UiTanStackTable>
  </UiCard>
</template>

<script lang="ts" setup>
  import type { ColumnDef } from "@tanstack/vue-table";
  import type { TanStackTableFeatures } from "~/components/Ui/TanStackTable.vue";

  const { data, error, refresh } = useFetch<Order[]>("/api/dashboard/orders", {
    key: "dashboard-orders",
    query: { limit: 6 },
    server: false,
  });

  const columns: ColumnDef<TanStackTableFeatures, Order>[] = [
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.customer.name,
      enableSorting: false,
    },
    {
      id: "items",
      header: "Items",
      accessorFn: (row) => row.items[0]?.name ?? "",
      enableSorting: false,
      meta: {
        class: { th: "hidden md:table-cell", td: "hidden max-w-56 truncate md:table-cell" },
      },
    },
    { accessorKey: "status", header: "Status", enableSorting: false },
    { accessorKey: "total", header: "Total", enableSorting: false },
    {
      accessorKey: "createdAt",
      header: "Placed",
      enableSorting: false,
      meta: { class: { th: "hidden sm:table-cell", td: "hidden sm:table-cell" } },
    },
  ];
</script>
