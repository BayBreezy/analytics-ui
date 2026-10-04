<template>
  <ol class="relative space-y-6 border-l pl-6">
    <li v-for="(entry, index) in CHANGELOG" :key="entry.title" class="relative">
      <span
        class="absolute top-1.5 -left-[1.9rem] size-3 rounded-full border-2 border-background"
        :class="index === 0 ? 'bg-primary' : 'bg-muted-foreground/40'"
      />
      <h3 class="flex flex-wrap items-center gap-2 font-semibold">
        {{ entry.title }}
        <UiBadge v-if="index === 0" size="sm">Latest</UiBadge>
      </h3>
      <p class="text-sm text-muted-foreground">{{ entry.description }}</p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li v-for="item in entry.items" :key="item">{{ item }}</li>
      </ul>
    </li>
  </ol>
</template>

<script lang="ts" setup></script>
