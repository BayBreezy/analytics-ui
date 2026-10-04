<template>
  <ResourceListPage
    resource="staff"
    :columns="columns"
    :filters="filters"
    search-placeholder="Search by name, email or role"
  >
    <template #name-cell="{ row }">
      <NuxtLink :to="`/staff/${row.original.id}`" class="block min-w-0">
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
    <template #role-cell="{ row }">
      <UiBadge variant="outline" class="capitalize">{{ row.original.role }}</UiBadge>
    </template>
    <template #status-cell="{ row }">
      <UiBadge
        :variant="row.original.status === 'active' ? 'success' : 'secondary'"
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

  const columns: ColumnDef<TanStackTableFeatures, StaffMember>[] = [
    { accessorKey: "name", header: "Team member" },
    { accessorKey: "phone", header: "Phone", enableSorting: false, meta: hideBelow("lg") },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "status", header: "Status", meta: hideBelow("md") },
    { accessorKey: "createdAt", header: "Joined", meta: hideBelow("md") },
  ];

  const filters = [
    {
      key: "role",
      label: "All roles",
      options: STAFF_ROLES.map((value) => ({ value, label: titleCase(value) })),
    },
    {
      key: "status",
      label: "All statuses",
      options: STAFF_STATUSES.map((value) => ({ value, label: titleCase(value) })),
    },
  ];
</script>
