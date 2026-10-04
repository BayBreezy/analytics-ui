<template>
  <UiCard class="h-full">
    <UiCardHeader>
      <UiCardTitle>Reminders</UiCardTitle>
      <UiCardDescription v-if="data">{{ remaining }} left for today</UiCardDescription>
      <UiCardDescription v-else>Your to-dos for today</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="space-y-4">
      <AppErrorState v-if="error && !data" what="reminders" @retry="refresh()" />
      <ul v-else-if="!data" class="space-y-4">
        <li v-for="n in 5" :key="n" class="flex items-center gap-3">
          <UiSkeleton class="size-4" />
          <UiSkeleton class="h-4 flex-1" />
        </li>
      </ul>
      <template v-else>
        <ul v-if="reminders.length" class="space-y-1">
          <li v-for="reminder in reminders" :key="reminder.id" class="group flex items-center">
            <label
              :for="reminder.id"
              class="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/60"
            >
              <UiCheckbox
                :id="reminder.id"
                :model-value="reminder.done"
                class="mt-0.5"
                @update:model-value="toggle(reminder, Boolean($event))"
              />
              <span class="min-w-0 flex-1">
                <span
                  class="block text-sm leading-snug"
                  :class="reminder.done && 'text-muted-foreground line-through'"
                >
                  {{ reminder.title }}
                </span>
                <span v-if="reminder.time" class="text-xs text-muted-foreground">
                  {{ reminder.time }}
                </span>
              </span>
            </label>
            <UiButton
              variant="ghost"
              size="icon-sm"
              class="shrink-0 opacity-100 transition-opacity focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              :aria-label="`Delete reminder: ${reminder.title}`"
              @click="remove(reminder)"
            >
              <Icon name="lucide:trash-2" />
            </UiButton>
          </li>
        </ul>
        <p v-else class="py-2 text-sm text-muted-foreground">
          Nothing to do. Add a reminder below.
        </p>

        <form class="space-y-1.5" novalidate @submit.prevent="add">
          <div class="flex gap-2">
            <UiInput
              v-model="newTitle"
              aria-label="New reminder"
              placeholder="Add a reminder"
              :aria-invalid="Boolean(addError)"
              :disabled="adding"
              @input="addError = ''"
            />
            <UiButton type="submit" variant="outline" :loading="adding">Add</UiButton>
          </div>
          <p v-if="addError" class="text-sm text-destructive">{{ addError }}</p>
        </form>
      </template>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const { data, error, refresh } = useFetch<Reminder[]>("/api/dashboard/reminders", {
    key: "dashboard-reminders",
    server: false,
  });

  // A copy to change straight away. The server catches up, and a failed change is put back.
  const reminders = ref<Reminder[]>([]);
  watch(data, (value) => (reminders.value = value ? value.map((item) => ({ ...item })) : []), {
    immediate: true,
  });
  const remaining = computed(() => reminders.value.filter((item) => !item.done).length);

  async function toggle(reminder: Reminder, done: boolean) {
    const previous = reminder.done;
    reminder.done = done;
    try {
      await $fetch(`/api/dashboard/reminders/${reminder.id}`, { method: "PUT", body: { done } });
    } catch (e) {
      reminder.done = previous;
      useSonner.error("Couldn't update the reminder", { description: getErrorMessage(e) });
    }
  }

  async function remove(reminder: Reminder) {
    const index = reminders.value.indexOf(reminder);
    reminders.value.splice(index, 1);
    try {
      await $fetch(`/api/dashboard/reminders/${reminder.id}`, { method: "DELETE" });
    } catch (e) {
      reminders.value.splice(index, 0, reminder);
      useSonner.error("Couldn't delete the reminder", { description: getErrorMessage(e) });
    }
  }

  const newTitle = ref("");
  const addError = ref("");
  const adding = ref(false);

  async function add() {
    const parsed = reminderSchema.safeParse({ title: newTitle.value });
    if (!parsed.success) {
      addError.value = parsed.error.issues[0]?.message ?? "Write what you need to do";
      return;
    }
    adding.value = true;
    try {
      const created = await $fetch<Reminder>("/api/dashboard/reminders", {
        method: "POST",
        body: parsed.data,
      });
      reminders.value.push(created);
      newTitle.value = "";
    } catch (e) {
      addError.value = getErrorMessage(e);
    } finally {
      adding.value = false;
    }
  }
</script>
