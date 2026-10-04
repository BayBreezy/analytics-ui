<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
    <p class="text-muted-foreground">
      <template v-if="total > 0">
        Showing {{ from }}–{{ to }} of {{ formatNumber(total) }}
      </template>
      <template v-else>No results</template>
    </p>
    <div class="flex flex-wrap items-center gap-4">
      <label class="flex items-center gap-2 text-muted-foreground">
        Rows
        <UiNativeSelect
          :model-value="String(pageSize)"
          class="h-8 w-20"
          aria-label="Rows per page"
          @update:model-value="emit('update:pageSize', Number($event))"
        >
          <option v-for="size in PAGE_SIZES" :key="size" :value="String(size)">{{ size }}</option>
        </UiNativeSelect>
      </label>
      <span class="text-muted-foreground">Page {{ page }} of {{ pageCount }}</span>
      <div class="flex items-center gap-1">
        <UiButton
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          :disabled="page <= 1"
          @click="emit('update:page', page - 1)"
        >
          <Icon name="lucide:chevron-left" />
        </UiButton>
        <UiButton
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          :disabled="page >= pageCount"
          @click="emit('update:page', page + 1)"
        >
          <Icon name="lucide:chevron-right" />
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{ page: number; pageSize: number; pageCount: number; total: number }>();
  const emit = defineEmits<{ "update:page": [page: number]; "update:pageSize": [size: number] }>();

  const from = computed(() => (props.page - 1) * props.pageSize + 1);
  const to = computed(() => Math.min(props.page * props.pageSize, props.total));
</script>
