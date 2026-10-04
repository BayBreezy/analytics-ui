<template>
  <fieldset>
    <legend class="mb-2 text-sm font-medium">Avatar</legend>
    <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Avatar">
      <button
        v-for="(src, index) in options"
        :key="src"
        type="button"
        role="radio"
        :aria-checked="src === modelValue"
        :aria-label="index === 0 && hasCurrent ? 'Current avatar' : `Avatar ${index + 1}`"
        class="rounded-full p-0.5 ring-offset-2 ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="src === modelValue ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'"
        @click="emit('update:modelValue', src)"
      >
        <UiAvatar :src="src" alt="" :fallback="initials" class="size-12" />
      </button>
    </div>
    <p v-if="errorMessage" class="mt-1.5 text-sm text-destructive">{{ errorMessage }}</p>
  </fieldset>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    modelValue?: string;
    /** The avatar the user has now. It is listed first, even if it isn't one of the presets. */
    current?: string;
    initials: string;
    errorMessage?: string;
  }>();
  const emit = defineEmits<{ "update:modelValue": [src: string] }>();

  const hasCurrent = computed(() => Boolean(props.current));
  const options = computed(() => [
    ...new Set([...(props.current ? [props.current] : []), ...AVATAR_PRESETS]),
  ]);
</script>
