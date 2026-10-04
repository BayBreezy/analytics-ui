<template>
  <UiCard class="h-full">
    <UiCardHeader>
      <UiCardTitle>Reminders</UiCardTitle>
      <UiCardDescription v-if="data">{{ remaining }} left for today</UiCardDescription>
      <UiCardDescription v-else>Your to-dos for today</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <DashboardError v-if="error" what="reminders" @retry="refresh()" />
      <ul v-else-if="!data" class="space-y-4">
        <li v-for="n in 5" :key="n" class="flex items-center gap-3">
          <UiSkeleton class="size-4" />
          <UiSkeleton class="h-4 flex-1" />
        </li>
      </ul>
      <ul v-else class="space-y-1">
        <li v-for="reminder in reminders" :key="reminder.id">
          <label
            :for="reminder.id"
            class="flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/60"
          >
            <UiCheckbox :id="reminder.id" v-model="reminder.done" class="mt-0.5" />
            <span class="min-w-0 flex-1">
              <span
                class="block text-sm leading-snug"
                :class="reminder.done && 'text-muted-foreground line-through'"
              >
                {{ reminder.title }}
              </span>
              <span class="text-xs text-muted-foreground">{{ reminder.time }}</span>
            </span>
          </label>
        </li>
      </ul>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const { data, error, refresh } = useFetch<Reminder[]>("/api/dashboard/reminders", {
    key: "dashboard-reminders",
    server: false,
  });

  // Checking a reminder off is local state only. There is nothing to save it to yet.
  const reminders = ref<Reminder[]>([]);
  watch(data, (value) => (reminders.value = value ? value.map((item) => ({ ...item })) : []), {
    immediate: true,
  });
  const remaining = computed(() => reminders.value.filter((item) => !item.done).length);
</script>
