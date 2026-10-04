<template>
  <ResourceListPage
    resource="customers"
    :columns="columns"
    :filters="filters"
    search-placeholder="Search by name, email or city"
  >
    <template #name-cell="{ row }">
      <NuxtLink :to="`/customers/${row.original.id}`" class="block min-w-0">
        <UiAvatarLabelGroup
          size="sm"
          :src="row.original.avatar"
          :alt="row.original.name"
          :fallback="initialsOf(row.original.name)"
          :title="row.original.name"
          :subtitle="row.original.email"
        />
      </NuxtLink>
    </template>
    <template #status-cell="{ row }">
      <UiBadge
        :variant="row.original.status === 'active' ? 'success' : 'secondary'"
        class="capitalize"
      >
        {{ row.original.status }}
      </UiBadge>
    </template>
    <template #totalSpent-cell="{ row }">
      <span class="font-medium">{{ formatCurrency(row.original.totalSpent ?? 0) }}</span>
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

  const columns: ColumnDef<TanStackTableFeatures, Customer>[] = [
    { accessorKey: "name", header: "Customer" },
    {
      accessorKey: "phone",
      header: "Phone",
      enableSorting: false,
      meta: hideBelow("lg"),
    },
    {
      id: "city",
      header: "Location",
      accessorFn: (row) => `${row.city}, ${row.country}`,
      meta: hideBelow("lg"),
    },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "ordersCount", header: "Orders", meta: hideBelow("md") },
    { accessorKey: "totalSpent", header: "Spent", meta: hideBelow("md") },
    { accessorKey: "createdAt", header: "Joined", meta: hideBelow("md") },
  ];

  const filters = [
    {
      key: "status",
      label: "All statuses",
      options: CUSTOMER_STATUSES.map((value) => ({ value, label: titleCase(value) })),
    },
  ];
</script>
