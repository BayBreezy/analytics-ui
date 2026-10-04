<template>
  <div class="space-y-4">
    <div class="relative">
      <Icon
        name="lucide:search"
        class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <UiInput
        v-model="search"
        type="search"
        placeholder="Search the FAQ"
        aria-label="Search the FAQ"
        class="pl-9"
      />
    </div>

    <UiEmpty v-if="!topics.length" class="min-h-48">
      <UiEmptyHeader>
        <UiEmptyMedia variant="icon"><Icon name="lucide:search-x" /></UiEmptyMedia>
        <UiEmptyTitle>No answers found</UiEmptyTitle>
        <UiEmptyDescription>
          Nothing matches "{{ search }}". Try another word, or send us a message.
        </UiEmptyDescription>
      </UiEmptyHeader>
      <UiEmptyContent>
        <UiButton variant="outline" @click="emit('contact')">Contact support</UiButton>
      </UiEmptyContent>
    </UiEmpty>

    <UiCard v-for="topic in topics" :key="topic.id" class="gap-2 py-4">
      <UiCardHeader>
        <UiCardTitle class="flex items-center gap-2">
          <Icon :name="topic.icon" class="size-4 text-muted-foreground" />
          {{ topic.label }}
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <UiAccordion
          type="multiple"
          :model-value="searching ? topic.items.map((item) => item.id) : undefined"
          :items="
            topic.items.map((item) => ({
              value: item.id,
              title: item.question,
              content: item.answer,
            }))
          "
        />
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
  const emit = defineEmits<{ contact: [] }>();

  const search = ref("");
  const searching = computed(() => search.value.trim().length > 0);

  /** The topics with only the questions that match the search. */
  const topics = computed(() => {
    const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return FAQ_TOPICS;
    return FAQ_TOPICS.map((topic) => ({
      ...topic,
      items: topic.items.filter((item) => {
        const text = `${item.question} ${item.answer}`.toLowerCase();
        return words.every((word) => text.includes(word));
      }),
    })).filter((topic) => topic.items.length);
  });
</script>
