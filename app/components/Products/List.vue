<template>
  <ResourceListPage
    resource="products"
    :columns="columns"
    :filters="filters"
    search-placeholder="Search by name, SKU or category"
  >
    <template #name-cell="{ row }">
      <NuxtLink :to="`/products/${row.original.id}`" class="flex min-w-0 items-center gap-3">
        <UiFancyIcon
          :icon="PRODUCT_CATEGORY_ICONS[row.original.category as ProductCategory]"
          :color="PRODUCT_CATEGORY_COLORS[row.original.category as ProductCategory]"
          theme="gradient"
          size="md"
        />
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold">{{ row.original.name }}</span>
          <span class="block text-xs text-muted-foreground">{{ row.original.sku }}</span>
        </span>
      </NuxtLink>
    </template>
    <template #price-cell="{ row }">
      <span class="font-medium">{{ formatCurrency(row.original.price) }}</span>
    </template>
    <template #stock-cell="{ row }">
      <ProductsStockBadge :stock="row.original.stock" />
    </template>
    <template #status-cell="{ row }">
      <UiBadge
        :variant="PRODUCT_STATUS_VARIANTS[row.original.status as ProductStatus]"
        class="capitalize"
      >
        {{ row.original.status }}
      </UiBadge>
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

  const columns: ColumnDef<TanStackTableFeatures, Product>[] = [
    { accessorKey: "name", header: "Product" },
    { accessorKey: "category", header: "Category", meta: hideBelow("lg") },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "stock", header: "Stock", meta: hideBelow("md") },
    { accessorKey: "status", header: "Status", meta: hideBelow("md") },
    { accessorKey: "createdAt", header: "Added", meta: hideBelow("lg") },
  ];

  const filters = [
    {
      key: "status",
      label: "All statuses",
      options: PRODUCT_STATUSES.map((value) => ({ value, label: titleCase(value) })),
    },
    {
      key: "category",
      label: "All categories",
      options: PRODUCT_CATEGORIES.map((value) => ({ value, label: value })),
    },
  ];
</script>
