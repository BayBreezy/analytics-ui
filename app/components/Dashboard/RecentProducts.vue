<template>
  <UiCard class="h-full">
    <UiCardHeader>
      <UiCardTitle>Recently added products</UiCardTitle>
      <UiCardDescription>New items in your catalog</UiCardDescription>
      <UiCardAction>
        <UiButton variant="outline" size="sm" to="/products">View all</UiButton>
      </UiCardAction>
    </UiCardHeader>
    <UiCardContent>
      <DashboardError v-if="error" what="products" @retry="refresh()" />
      <ul v-else-if="!data" class="space-y-4">
        <li v-for="n in 5" :key="n" class="flex items-center gap-4">
          <UiSkeleton class="size-12 rounded-lg" />
          <div class="flex-1 space-y-2">
            <UiSkeleton class="h-4 w-48" />
            <UiSkeleton class="h-3 w-24" />
          </div>
          <UiSkeleton class="h-4 w-16" />
        </li>
      </ul>
      <ul v-else class="divide-y">
        <li
          v-for="product in data"
          :key="product.id"
          class="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          >
            <Icon :name="categoryIcons[product.category]" class="size-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ product.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ product.category }} · added {{ formatRelative(product.createdAt) }}
            </p>
          </div>
          <div class="hidden w-28 shrink-0 sm:block">
            <UiBadge v-if="product.stock === 0" variant="error">Out of stock</UiBadge>
            <UiBadge v-else-if="product.stock < 20" variant="warning"
              >Low: {{ product.stock }}</UiBadge
            >
            <span v-else class="text-xs text-muted-foreground">{{ product.stock }} in stock</span>
          </div>
          <p class="w-20 shrink-0 text-right text-sm font-semibold">
            {{ formatCurrency(product.price) }}
          </p>
        </li>
      </ul>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const { data, error, refresh } = useFetch<Product[]>("/api/dashboard/products", {
    key: "dashboard-products",
    query: { limit: 5 },
    server: false,
  });

  const categoryIcons: Record<ProductCategory, string> = {
    Electronics: "lucide:headphones",
    Clothing: "lucide:shirt",
    Home: "lucide:armchair",
    Beauty: "lucide:sparkles",
    Sports: "lucide:dumbbell",
    Books: "lucide:book-open",
  };
</script>
