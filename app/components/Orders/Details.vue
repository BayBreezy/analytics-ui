<template>
  <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <UiCard class="gap-0 overflow-hidden pb-0">
        <UiCardHeader class="border-b pb-4">
          <UiCardTitle>Items</UiCardTitle>
          <UiCardDescription>
            {{ record.items.length }} {{ record.items.length === 1 ? "item" : "items" }} in this
            order
          </UiCardDescription>
        </UiCardHeader>
        <ul class="divide-y">
          <li
            v-for="item in record.items"
            :key="item.productId"
            class="flex items-center gap-4 px-6 py-4"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ item.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formatCurrency(item.price) }} × {{ item.quantity }}
              </p>
            </div>
            <p class="text-sm font-medium">{{ formatCurrency(item.price * item.quantity) }}</p>
          </li>
        </ul>
        <div class="flex items-center justify-between border-t bg-muted/40 px-6 py-4">
          <span class="text-sm font-medium">Total</span>
          <span class="text-lg font-bold">{{ formatCurrency(record.total) }}</span>
        </div>
      </UiCard>

      <UiCard v-if="record.notes">
        <UiCardHeader>
          <UiCardTitle>Notes</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="text-sm leading-relaxed">{{ record.notes }}</UiCardContent>
      </UiCard>
    </div>

    <div class="space-y-6">
      <UiCard>
        <UiCardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Status</span>
            <UiBadge :variant="ORDER_STATUS_VARIANTS[record.status]" class="capitalize">
              {{ record.status }}
            </UiBadge>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Placed</span>
            <span class="text-sm font-medium">{{ formatDate(record.createdAt) }}</span>
          </div>
          <UiDropdownMenu v-if="canWrite">
            <UiDropdownMenuTrigger as-child>
              <UiButton variant="outline" class="w-full" :loading="updating">
                Update status
                <Icon name="lucide:chevron-down" />
              </UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent class="w-(--reka-dropdown-menu-trigger-width)">
              <UiDropdownMenuItem
                v-for="status in ORDER_STATUSES.filter((value) => value !== record.status)"
                :key="status"
                class="capitalize"
                @select="updateStatus(status)"
              >
                {{ status }}
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Customer</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <UiAvatarLabelGroup
            :src="record.customer.avatar"
            :alt="record.customer.name"
            :fallback="initialsOf(record.customer.name)"
            :title="record.customer.name"
            :subtitle="record.customer.email"
          />
          <UiButton
            variant="outline"
            size="sm"
            class="w-full"
            :to="`/customers/${record.customer.id}`"
          >
            View customer
          </UiButton>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{ record: Order }>();
  const emit = defineEmits<{ changed: [] }>();

  const { canWrite } = useResourcePermissions("orders");
  const updating = ref(false);
  async function updateStatus(status: OrderStatus) {
    updating.value = true;
    try {
      await $fetch(`/api/orders/${props.record.id}` as string, { method: "PUT", body: { status } });
      useSonner("Order updated", { description: `${props.record.number} is now ${status}.` });
      emit("changed");
    } catch (error) {
      useSonner.error("Couldn't update the order", { description: getErrorMessage(error) });
    } finally {
      updating.value = false;
    }
  }
</script>
