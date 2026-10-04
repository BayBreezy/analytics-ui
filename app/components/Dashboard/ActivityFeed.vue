<template>
  <UiCard class="h-full">
    <UiCardHeader>
      <UiCardTitle>Recent activity</UiCardTitle>
      <UiCardDescription>What's happening in your store</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <AppErrorState v-if="error" what="activity" @retry="refresh()" />
      <ul v-else-if="!data" class="space-y-5">
        <li v-for="n in 6" :key="n" class="flex gap-3">
          <UiSkeleton class="size-8 rounded-full" />
          <div class="flex-1 space-y-2">
            <UiSkeleton class="h-4 w-28" />
            <UiSkeleton class="h-3 w-full" />
          </div>
        </li>
      </ul>
      <UiScrollArea v-else class="h-[360px] pr-3">
        <ol class="relative space-y-5 pb-1">
          <li v-for="item in data" :key="item.id" class="relative flex gap-3">
            <span
              class="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full"
              :class="appearance[item.type].class"
            >
              <Icon :name="appearance[item.type].icon" class="size-4" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-2">
                <p class="text-sm font-medium">{{ item.title }}</p>
                <span class="shrink-0 text-xs text-muted-foreground">
                  {{ formatRelative(item.createdAt) }}
                </span>
              </div>
              <p class="text-sm text-muted-foreground">{{ item.description }}</p>
            </div>
          </li>
        </ol>
      </UiScrollArea>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const { data, error, refresh } = useFetch<Activity[]>("/api/dashboard/activity", {
    key: "dashboard-activity",
    server: false,
  });

  const appearance: Record<ActivityType, { icon: string; class: string }> = {
    order: {
      icon: "lucide:shopping-bag",
      class: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    customer: {
      icon: "lucide:user-plus",
      class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    review: { icon: "lucide:star", class: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    refund: {
      icon: "lucide:rotate-ccw",
      class: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    stock: {
      icon: "lucide:package-minus",
      class: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
  };
</script>
