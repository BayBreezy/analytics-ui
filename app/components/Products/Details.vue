<template>
  <div class="grid gap-6 *:min-w-0 lg:grid-cols-3">
    <UiCard class="lg:col-span-2">
      <UiCardHeader>
        <UiCardTitle>Product details</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="space-y-6">
        <dl class="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
          <div v-for="item in details" :key="item.label">
            <dt class="text-muted-foreground">{{ item.label }}</dt>
            <dd class="mt-1 font-medium">{{ item.value }}</dd>
          </div>
        </dl>
        <div>
          <p class="text-sm text-muted-foreground">Description</p>
          <p class="mt-1 text-sm leading-relaxed">
            {{ record.description || "No description yet." }}
          </p>
        </div>
      </UiCardContent>
    </UiCard>

    <div class="space-y-6">
      <UiCard>
        <UiCardContent class="flex items-center gap-4">
          <UiFancyIcon
            :icon="PRODUCT_CATEGORY_ICONS[record.category]"
            :color="PRODUCT_CATEGORY_COLORS[record.category]"
            theme="gradient"
            size="lg"
          />
          <div>
            <p class="text-sm text-muted-foreground">Price</p>
            <p class="text-2xl font-bold tracking-tight">{{ formatCurrency(record.price) }}</p>
          </div>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent>
          <p class="text-sm text-muted-foreground">In stock</p>
          <p class="mt-1 text-2xl font-bold tracking-tight">{{ formatNumber(record.stock) }}</p>
          <ProductsStockBadge v-if="record.stock < 20" :stock="record.stock" class="mt-2" />
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{ record: Product }>();

  const details = computed(() => [
    { label: "SKU", value: props.record.sku },
    { label: "Category", value: props.record.category },
    { label: "Status", value: titleCase(props.record.status) },
    { label: "Added", value: formatDate(props.record.createdAt) },
  ]);
</script>
