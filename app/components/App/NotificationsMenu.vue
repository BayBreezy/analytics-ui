<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="ghost"
        size="icon"
        class="relative"
        :aria-label="unread ? `Notifications, ${unread} unread` : 'Notifications'"
      >
        <Icon name="lucide:bell" />
        <span
          v-if="unread"
          class="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-white"
          aria-hidden="true"
        >
          {{ unread > 9 ? "9+" : unread }}
        </span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-80 max-w-[calc(100vw-2rem)] p-0">
      <div class="flex items-center justify-between gap-2 border-b px-3 py-2">
        <p class="text-sm font-semibold">Notifications</p>
        <UiButton
          variant="ghost"
          size="sm"
          class="-mr-2 h-7"
          :disabled="!unread"
          @click.stop="markAllRead"
        >
          Mark all as read
        </UiButton>
      </div>

      <AppErrorState
        v-if="error && !data"
        what="notifications"
        class="min-h-32 py-4"
        @retry="refresh()"
      />
      <ul v-else-if="!data" class="space-y-3 p-3">
        <li v-for="n in 3" :key="n" class="flex items-center gap-3">
          <UiSkeleton class="size-8 rounded-full" />
          <div class="flex-1 space-y-2">
            <UiSkeleton class="h-3 w-3/4" />
            <UiSkeleton class="h-3 w-1/2" />
          </div>
        </li>
      </ul>
      <UiEmpty v-else-if="!data.items.length" class="min-h-32 p-4">
        <UiEmptyHeader>
          <UiEmptyMedia variant="icon"><Icon name="lucide:bell-off" /></UiEmptyMedia>
          <UiEmptyTitle>You're all caught up</UiEmptyTitle>
          <UiEmptyDescription>New orders, customers and low stock show up here.</UiEmptyDescription>
        </UiEmptyHeader>
      </UiEmpty>
      <div v-else class="max-h-80 overflow-y-auto p-1">
        <UiDropdownMenuItem
          v-for="item in data.items"
          :key="item.id"
          class="items-start gap-3 py-2"
          @select="open(item)"
        >
          <UiFancyIcon
            :icon="TYPES[item.type].icon"
            theme="light"
            :color="TYPES[item.type].color"
            size="sm"
            class="mt-0.5"
          />
          <span class="min-w-0 flex-1">
            <span class="flex items-start justify-between gap-2">
              <span class="text-sm" :class="item.read ? 'font-normal' : 'font-semibold'">
                {{ item.title }}
              </span>
              <span
                v-if="!item.read"
                class="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                role="img"
                aria-label="Unread"
              />
            </span>
            <span class="block text-xs text-muted-foreground">{{ item.body }}</span>
            <span class="block text-xs text-muted-foreground/80">
              {{ formatRelative(item.createdAt) }}
            </span>
          </span>
        </UiDropdownMenuItem>
      </div>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>

<script lang="ts" setup>
  const TYPES = {
    newOrder: { icon: "lucide:shopping-cart", color: "info" },
    lowStock: { icon: "lucide:triangle-alert", color: "warning" },
    newCustomer: { icon: "lucide:user-plus", color: "success" },
    weeklyReport: { icon: "lucide:chart-column", color: "purple" },
    teamInvites: { icon: "lucide:users-round", color: "primary" },
  } as const;

  const { data, error, refresh } = useFetch<NotificationsResponse>("/api/notifications", {
    key: "notifications",
    server: false,
  });
  const unread = computed(() => data.value?.unread ?? 0);

  // New things happen while the page is open, so look again every so often, when the window is
  // focused again and when moving to another page (for example after creating an order).
  useIntervalFn(() => refresh(), 30_000);
  useEventListener("focus", () => refresh());
  const route = useRoute();
  watch(
    () => route.fullPath,
    () => refresh()
  );

  async function open(item: AppNotification) {
    if (!item.read) {
      // Show it as read straight away. The server catches up in the background.
      item.read = true;
      if (data.value) data.value.unread = Math.max(0, data.value.unread - 1);
      $fetch(`/api/notifications/${item.id}/read`, { method: "POST" }).catch(() => refresh());
    }
    await navigateTo(item.href);
  }

  async function markAllRead() {
    try {
      data.value = await $fetch<NotificationsResponse>("/api/notifications/read-all", {
        method: "POST",
      });
    } catch (e) {
      useSonner.error("Couldn't mark them as read", { description: getErrorMessage(e) });
    }
  }
</script>
