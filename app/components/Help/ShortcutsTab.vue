<template>
  <div class="grid gap-6 md:grid-cols-2">
    <UiCard v-for="group in SHORTCUTS" :key="group.group">
      <UiCardHeader>
        <UiCardTitle>{{ group.group }}</UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <ul class="divide-y">
          <li
            v-for="shortcut in group.items"
            :key="shortcut.description"
            class="flex items-center justify-between gap-4 py-2.5 text-sm"
          >
            <span>{{ shortcut.description }}</span>
            <span class="flex shrink-0 items-center gap-1">
              <template v-for="key in shortcut.keys" :key="key">
                <span v-if="key === 'then'" class="text-xs text-muted-foreground">then</span>
                <kbd v-else class="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {{ key }}
                </kbd>
              </template>
            </span>
          </li>
        </ul>
      </UiCardContent>
    </UiCard>
    <p class="text-sm text-muted-foreground md:col-span-2">
      Shortcuts don't work while you are typing in a field or when a dialog is open.
    </p>
  </div>
</template>

<script lang="ts" setup></script>
