<template>
  <UiCard class="h-full">
    <UiCardHeader>
      <UiCardTitle>New customers</UiCardTitle>
      <UiCardDescription>People who recently joined</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <DashboardError v-if="error" what="customers" @retry="refresh()" />
      <ul v-else-if="!data" class="space-y-4">
        <li v-for="n in 6" :key="n" class="flex items-center gap-3">
          <UiSkeleton class="size-10 rounded-full" />
          <div class="flex-1 space-y-2">
            <UiSkeleton class="h-4 w-32" />
            <UiSkeleton class="h-3 w-44" />
          </div>
        </li>
      </ul>
      <ul v-else class="space-y-4">
        <li v-for="customer in data" :key="customer.id" class="flex items-center gap-3">
          <UiAvatarLabelGroup
            :src="customer.avatar"
            :alt="customer.name"
            :fallback="initialsOf(customer.name)"
            :title="customer.name"
            :subtitle="customer.email"
          />
          <span class="shrink-0 text-xs text-muted-foreground">
            {{ formatRelative(customer.createdAt) }}
          </span>
        </li>
      </ul>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const { data, error, refresh } = useFetch<Customer[]>("/api/dashboard/customers", {
    key: "dashboard-customers",
    query: { limit: 6 },
    server: false,
  });
</script>
