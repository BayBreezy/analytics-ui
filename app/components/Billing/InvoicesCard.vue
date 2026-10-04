<template>
  <UiCard class="gap-0 overflow-hidden pb-0">
    <UiCardHeader class="border-b pb-4">
      <UiCardTitle>Invoices</UiCardTitle>
      <UiCardDescription>Your billing history</UiCardDescription>
    </UiCardHeader>
    <AppErrorState v-if="error && !invoices" what="invoices" class="py-8" @retry="emit('retry')" />
    <div v-else-if="!invoices" class="space-y-4 p-6">
      <UiSkeleton v-for="n in 5" :key="n" class="h-10 w-full" />
    </div>
    <UiEmpty v-else-if="!invoices.length" class="min-h-48 p-6">
      <UiEmptyHeader>
        <UiEmptyMedia variant="icon"><Icon name="lucide:receipt" /></UiEmptyMedia>
        <UiEmptyTitle>No invoices yet</UiEmptyTitle>
        <UiEmptyDescription>They will show up here after your first payment.</UiEmptyDescription>
      </UiEmptyHeader>
    </UiEmpty>
    <UiTanStackTable
      v-else
      :data="invoices"
      :columns="columns"
      :show-footer="false"
      :initial-page-size="6"
      :table-options="{ enableRowPinning: false }"
      class="border-0"
    >
      <template #number-cell="{ row }">
        <span class="font-medium">{{ row.original.number }}</span>
      </template>
      <template #issuedAt-cell="{ row }">
        <span class="text-muted-foreground">{{ formatDate(row.original.issuedAt) }}</span>
      </template>
      <template #amount-cell="{ row }">
        <span class="font-medium">{{ formatCurrency(row.original.amount) }}</span>
      </template>
      <template #status-cell="{ row }">
        <UiBadge :variant="INVOICE_STATUS_VARIANTS[row.original.status]" class="capitalize">
          {{ row.original.status }}
        </UiBadge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UiButton
            as="a"
            :href="`/api/billing/invoices/${row.original.id}`"
            target="_blank"
            rel="noopener"
            variant="ghost"
            size="icon-sm"
            :aria-label="`View invoice ${row.original.number}`"
          >
            <Icon name="lucide:external-link" />
          </UiButton>
          <UiButton
            as="a"
            :href="`/api/billing/invoices/${row.original.id}?download=1`"
            variant="ghost"
            size="icon-sm"
            :aria-label="`Download invoice ${row.original.number}`"
          >
            <Icon name="lucide:download" />
          </UiButton>
        </div>
      </template>
    </UiTanStackTable>
  </UiCard>
</template>

<script lang="ts" setup>
  import type { ColumnDef } from "@tanstack/vue-table";
  import type { TanStackTableFeatures } from "~/components/Ui/TanStackTable.vue";

  defineProps<{ invoices?: Invoice[]; error?: unknown }>();
  const emit = defineEmits<{ retry: [] }>();

  const INVOICE_STATUS_VARIANTS = {
    paid: "success",
    open: "warning",
    failed: "destructive",
  } as const;

  const hide = { class: { th: "hidden sm:table-cell", td: "hidden sm:table-cell" } };
  const columns: ColumnDef<TanStackTableFeatures, Invoice>[] = [
    { accessorKey: "number", header: "Invoice", enableSorting: false },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: false,
      meta: hide,
    },
    { accessorKey: "issuedAt", header: "Date", enableSorting: false },
    { accessorKey: "amount", header: "Amount", enableSorting: false },
    { accessorKey: "status", header: "Status", enableSorting: false },
    { id: "actions", header: "", enableSorting: false },
  ];
</script>
