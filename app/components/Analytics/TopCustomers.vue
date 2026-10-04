<template>
  <UiCard class="gap-0 overflow-hidden pb-0">
    <UiCardHeader class="border-b pb-4">
      <UiCardTitle>Top customers</UiCardTitle>
      <UiCardDescription>Customers who spent the most</UiCardDescription>
      <UiCardAction>
        <UiButton variant="outline" size="sm" to="/customers?sort=totalSpent&order=desc">
          View all
        </UiButton>
      </UiCardAction>
    </UiCardHeader>
    <AppErrorState v-if="error" what="customers" class="py-6" @retry="emit('retry')" />
    <div v-else-if="!customers" class="space-y-4 p-6">
      <UiSkeleton v-for="n in 6" :key="n" class="h-10 w-full" />
    </div>
    <UiTanStackTable
      v-else
      :data="customers"
      :columns="columns"
      :show-footer="false"
      :initial-page-size="10"
      :table-options="{ enableRowPinning: false }"
      class="border-0"
    >
      <template #rank-cell="{ row }">
        <span class="font-medium text-muted-foreground">{{ row.index + 1 }}</span>
      </template>
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
      <template #spent-cell="{ row }">
        <span class="font-medium">{{ formatCurrency(row.original.spent) }}</span>
      </template>
    </UiTanStackTable>
  </UiCard>
</template>

<script lang="ts" setup>
  import type { ColumnDef } from "@tanstack/vue-table";
  import type { TanStackTableFeatures } from "~/components/Ui/TanStackTable.vue";

  defineProps<{ customers?: TopCustomer[]; error?: unknown }>();
  const emit = defineEmits<{ retry: [] }>();

  const columns: ColumnDef<TanStackTableFeatures, TopCustomer>[] = [
    { id: "rank", header: "#", enableSorting: false },
    { id: "name", header: "Customer", accessorFn: (row) => row.name, enableSorting: false },
    {
      accessorKey: "orders",
      header: "Orders",
      enableSorting: false,
      meta: { class: { th: "hidden sm:table-cell", td: "hidden sm:table-cell" } },
    },
    { id: "spent", header: "Spent", accessorFn: (row) => row.spent, enableSorting: false },
  ];
</script>
