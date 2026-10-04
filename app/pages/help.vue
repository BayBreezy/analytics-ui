<template>
  <div class="mx-auto w-full max-w-4xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Help</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Answers to common questions, a way to reach support, and what's new.
      </p>
    </div>

    <UiTabs v-model="tab">
      <UiTabsList class="max-w-full overflow-x-auto">
        <UiTabsTrigger v-for="item in TABS" :key="item.value" :value="item.value">
          {{ item.label }}
        </UiTabsTrigger>
      </UiTabsList>
    </UiTabs>

    <HelpFaqTab v-if="tab === 'faq'" @contact="tab = 'contact'" />
    <HelpContactTab
      v-else-if="tab === 'contact'"
      :tickets="tickets"
      :error="error"
      @retry="refresh()"
      @changed="refresh()"
    />
    <HelpShortcutsTab v-else-if="tab === 'shortcuts'" />
    <HelpChangelogTab v-else />
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Help" });

  const TABS = [
    { value: "faq", label: "FAQ" },
    { value: "contact", label: "Contact support" },
    { value: "shortcuts", label: "Shortcuts" },
    { value: "news", label: "What's new" },
  ] as const;

  const tab = useQueryParam<(typeof TABS)[number]["value"]>(
    "tab",
    "faq",
    TABS.map((item) => item.value)
  );

  const {
    data: tickets,
    error,
    refresh,
  } = useFetch<Ticket[]>("/api/support/tickets", { key: "support-tickets", server: false });
</script>
