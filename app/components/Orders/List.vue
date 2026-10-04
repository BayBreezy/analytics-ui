<template>
  <ResourceListPage
    resource="orders"
    :columns="columns"
    :filters="filters"
    search-placeholder="Search by order, customer or product"
  >
    <template #number-cell="{ row }">
      <NuxtLink :to="`/orders/${row.original.id}`" class="font-semibold hover:underline">
        {{ row.original.number }}
      </NuxtLink>
    </template>
    <template #customer-cell="{ row }">
      <NuxtLink :to="`/customers/${row.original.customer.id}`" class="block min-w-0">
        <UiAvatarLabelGroup
          size="sm"
          :src="row.original.customer.avatar"
          :alt="row.original.customer.name"
          :fallback="initialsOf(row.original.customer.name)"
          :title="row.original.customer.name"
          :subtitle="row.original.customer.email"
        />
      </NuxtLink>
    </template>
    <template #items-cell="{ row }">
      <span class="block max-w-56 truncate">{{ row.original.items[0]?.name }}</span>
      <span v-if="row.original.items.length > 1" class="text-xs text-muted-foreground">
        +{{ row.original.items.length - 1 }} more
      </span>
    </template>
    <template #status-cell="{ row }">
      <UiBadge
        :variant="ORDER_STATUS_VARIANTS[row.original.status as OrderStatus]"
        class="capitalize"
      >
        {{ row.original.status }}
      </UiBadge>
    </template>
    <template #total-cell="{ row }">
      <span class="font-medium">{{ formatCurrency(row.original.total) }}</span>
    </template>
    <template #createdAt-cell="{ row }">
      <span class="text-muted-foreground">{{ formatDate(row.original.createdAt) }}</span>
    </template>
  </ResourceListPage>
</template>

<script lang="ts" setup>
  import type { ColumnDef } from "@tanstack/vue-table";
  import type { TanStackTableFeatures } from "~/components/Ui/TanStackTable.vue";

  const hideBelow = (breakpoint: "md" | "lg") => {
    const show = breakpoint === "md" ? "hidden md:table-cell" : "hidden lg:table-cell";
    return { class: { th: show, td: show } };
  };

  const columns: ColumnDef<TanStackTableFeatures, Order>[] = [
    { accessorKey: "number", header: "Order" },
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
      meta: hideBelow("lg"),
    },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "total", header: "Total" },
    { accessorKey: "createdAt", header: "Placed", meta: hideBelow("md") },
  ];

  const filters = [
    {
      key: "status",
      label: "All statuses",
      options: ORDER_STATUSES.map((value) => ({ value, label: titleCase(value) })),
    },
    // Set by the "View all" link on a customer's page.
    { key: "customerId", label: "Filtered by customer", options: [], hidden: true },
  ];
</script>
