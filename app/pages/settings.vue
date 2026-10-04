<template>
  <div class="mx-auto w-full max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Settings</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Manage your store, how the app looks and how it keeps your account safe.
      </p>
    </div>

    <UiTabs v-model="tab">
      <UiTabsList class="max-w-full overflow-x-auto">
        <UiTabsTrigger v-for="item in TABS" :key="item.value" :value="item.value">
          {{ item.label }}
        </UiTabsTrigger>
      </UiTabsList>
    </UiTabs>

    <!-- Appearance, security and data don't need the store settings, so they never wait for them. -->
    <SettingsAppearanceTab v-if="tab === 'appearance'" />
    <SettingsSecurityTab v-else-if="tab === 'security'" />
    <SettingsDataTab v-else-if="tab === 'data'" />
    <AppErrorState v-else-if="error" what="your settings" @retry="refresh()" />
    <div v-else-if="!settings" class="space-y-3">
      <UiSkeleton class="h-10 w-full" />
      <UiSkeleton class="h-48 w-full" />
    </div>
    <SettingsGeneralTab v-else-if="tab === 'general'" :settings="settings" />
    <SettingsNotificationsTab v-else :settings="settings" />
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Settings" });

  const TABS = [
    { value: "general", label: "General" },
    { value: "appearance", label: "Appearance" },
    { value: "notifications", label: "Notifications" },
    { value: "security", label: "Security" },
    { value: "data", label: "Data" },
  ] as const;

  const tab = useQueryParam<(typeof TABS)[number]["value"]>(
    "tab",
    "general",
    TABS.map((item) => item.value)
  );

  const { settings, error, refresh } = useSettings();
</script>
