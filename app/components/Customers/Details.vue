<template>
  <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <div class="grid gap-4 sm:grid-cols-3">
        <UiCard v-for="stat in stats" :key="stat.label">
          <UiCardContent>
            <p class="text-sm font-medium text-muted-foreground">{{ stat.label }}</p>
            <p class="mt-2 text-2xl font-bold tracking-tight">{{ stat.value }}</p>
          </UiCardContent>
        </UiCard>
      </div>

      <UiCard class="gap-0 overflow-hidden pb-0">
        <UiCardHeader class="border-b pb-4">
          <UiCardTitle>Recent orders</UiCardTitle>
          <UiCardDescription>The latest orders from this customer</UiCardDescription>
          <UiCardAction>
            <UiButton variant="outline" size="sm" :to="`/orders?customerId=${record.id}`">
              View all
            </UiButton>
          </UiCardAction>
        </UiCardHeader>
        <AppErrorState v-if="error" what="orders" class="py-6" @retry="refresh()" />
        <div v-else-if="!orders" class="space-y-4 p-6">
          <UiSkeleton v-for="n in 3" :key="n" class="h-10 w-full" />
        </div>
        <p v-else-if="!orders.items.length" class="p-6 text-sm text-muted-foreground">
          This customer hasn't placed any orders yet.
        </p>
        <ul v-else class="divide-y">
          <li v-for="order in orders.items" :key="order.id">
            <NuxtLink
              :to="`/orders/${order.id}`"
              class="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">{{ order.number }}</p>
                <p class="truncate text-xs text-muted-foreground">
                  {{ order.items.map((item) => item.name).join(", ") }}
                </p>
              </div>
              <UiBadge :variant="ORDER_STATUS_VARIANTS[order.status]" class="capitalize">
                {{ order.status }}
              </UiBadge>
              <span class="w-24 text-right text-sm font-medium">{{
                formatCurrency(order.total)
              }}</span>
            </NuxtLink>
          </li>
        </ul>
      </UiCard>
    </div>

    <UiCard class="h-fit">
      <UiCardContent class="space-y-5">
        <div class="flex items-center gap-4">
          <UiAvatar
            :src="record.avatar"
            :alt="record.name"
            :fallback="initialsOf(record.name)"
            class="size-14"
          />
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ record.name }}</p>
            <UiBadge
              :variant="record.status === 'active' ? 'success' : 'secondary'"
              class="mt-1 capitalize"
            >
              {{ record.status }}
            </UiBadge>
          </div>
        </div>
        <dl class="space-y-3 text-sm">
          <div v-for="item in details" :key="item.label" class="flex items-start gap-3">
            <Icon :name="item.icon" class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div class="min-w-0">
              <dt class="sr-only">{{ item.label }}</dt>
              <dd class="break-words">{{ item.value }}</dd>
            </div>
          </div>
        </dl>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{ record: Customer }>();

  const {
    data: orders,
    error,
    refresh,
  } = useFetch<Paginated<Order>>("/api/orders", {
    key: `customer-orders-${props.record.id}`,
    query: { customerId: props.record.id, pageSize: 5, sort: "createdAt", order: "desc" },
    server: false,
  });

  const stats = computed(() => [
    { label: "Orders", value: formatNumber(props.record.ordersCount ?? 0) },
    { label: "Total spent", value: formatCurrency(props.record.totalSpent ?? 0) },
    { label: "Customer since", value: formatDate(props.record.createdAt) },
  ]);

  const details = computed(() => [
    { label: "Email", icon: "lucide:mail", value: props.record.email },
    { label: "Phone", icon: "lucide:phone", value: props.record.phone },
    {
      label: "Location",
      icon: "lucide:map-pin",
      value: `${props.record.city}, ${props.record.country}`,
    },
  ]);
</script>
