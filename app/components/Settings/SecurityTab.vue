<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Automatic sign-out</UiCardTitle>
      <UiCardDescription>
        Sign out after a period without mouse, keyboard, scroll or touch activity. Activity in any
        open tab counts. Applies to this browser only.
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <div class="w-full sm:w-56">
        <UiNativeSelect v-model="timeout" aria-label="Sign out after">
          <option v-for="option in IDLE_TIMEOUTS" :key="option.value" :value="String(option.value)">
            {{ option.value ? `After ${option.label}` : "Never" }}
          </option>
        </UiNativeSelect>
      </div>
      <p v-if="idleTimeoutMs === 0" class="mt-3 text-sm text-muted-foreground">
        You will stay signed in until you log out or close the browser (when "Remember me" is off).
      </p>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const { idleTimeoutMs } = usePreferences();

  const timeout = computed({
    get: () => String(idleTimeoutMs.value),
    set: (value: string) => {
      idleTimeoutMs.value = Number(value);
      useSonner("Sign-out setting updated");
    },
  });
</script>
