<template>
  <div class="grid gap-6">
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Theme</UiCardTitle>
        <UiCardDescription>Applies to this browser only.</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <div class="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Theme">
          <button
            v-for="theme in THEMES"
            :key="theme.value"
            type="button"
            role="radio"
            :aria-checked="selected === theme.value"
            class="rounded-lg border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :class="
              selected === theme.value ? 'border-primary ring-1 ring-primary' : 'hover:bg-accent/50'
            "
            @click="colorMode.preference = theme.value"
          >
            <div
              class="mb-3 flex h-16 overflow-hidden rounded-md border"
              :class="theme.value === 'dark' ? 'dark' : ''"
            >
              <template v-if="theme.value === 'system'">
                <div class="flex-1 bg-white" />
                <div class="flex-1 bg-neutral-900" />
              </template>
              <template v-else>
                <div
                  class="w-1/4 border-r"
                  :class="theme.value === 'dark' ? 'bg-neutral-800' : 'bg-neutral-100'"
                />
                <div
                  class="flex-1 p-2"
                  :class="theme.value === 'dark' ? 'bg-neutral-900' : 'bg-white'"
                >
                  <div
                    class="h-2 w-1/2 rounded"
                    :class="theme.value === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'"
                  />
                </div>
              </template>
            </div>
            <p class="flex items-center gap-2 text-sm font-medium">
              <Icon :name="theme.icon" class="size-4" />
              {{ theme.label }}
            </p>
          </button>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Tables</UiCardTitle>
        <UiCardDescription>
          How many rows lists show per page. A page size picked in the list itself still wins.
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <div class="w-full sm:w-56">
          <UiNativeSelect v-model="pageSizeValue" aria-label="Default page size">
            <option v-for="size in PAGE_SIZES" :key="size" :value="String(size)">
              {{ size }} rows per page
            </option>
          </UiNativeSelect>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
  const THEMES = [
    { value: "light", label: "Light", icon: "lucide:sun" },
    { value: "dark", label: "Dark", icon: "lucide:moon" },
    { value: "system", label: "System", icon: "lucide:monitor" },
  ] as const;

  const colorMode = useColorMode();
  // The saved theme is only known in the browser, so nothing is shown as selected until mounted.
  const mounted = useMounted();
  const selected = computed(() => (mounted.value ? colorMode.preference : undefined));
  const { pageSize } = usePreferences();

  const pageSizeValue = computed({
    get: () => String(pageSize.value),
    set: (value: string) => {
      pageSize.value = Number(value);
      useSonner("Default page size updated");
    },
  });
</script>
