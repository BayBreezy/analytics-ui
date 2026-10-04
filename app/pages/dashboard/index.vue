<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Welcome back, {{ firstName }}</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Here's what's happening with your store today.
      </p>
    </div>

    <DashboardStats />

    <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
      <div class="lg:col-span-2"><DashboardSalesChart /></div>
      <DashboardNewCustomers />
    </div>

    <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
      <div class="lg:col-span-2"><DashboardRecentOrders /></div>
      <DashboardActivityFeed />
    </div>

    <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
      <div class="lg:col-span-2"><DashboardRecentProducts /></div>
      <DashboardReminders />
    </div>
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Dashboard" });

  const { user } = useAuth();
  const firstName = computed(() => user.value?.name.split(" ")[0] ?? "there");
</script>
