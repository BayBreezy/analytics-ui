<template>
  <section class="grid gap-5 md:grid-cols-2">
    <!-- Revenue -->
    <div class="rounded-lg border bg-card p-6">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">Total Revenue</p>
        <span class="shrink-0">
          <Icon name="heroicons:banknotes" class="h-4 w-4 text-muted-foreground" />
        </span>
      </div>

      <p class="mt-1.5 text-xl font-extrabold">$45,231.89</p>
      <p class="text-xs text-muted-foreground">20% more than last month</p>
    </div>
    <!-- Sales -->
    <div class="rounded-lg border bg-card p-6">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">Sales</p>
        <span class="shrink-0">
          <Icon name="heroicons:credit-card" class="h-4 w-4 text-muted-foreground" />
        </span>
      </div>

      <p class="mt-1.5 text-xl font-extrabold">$12,231</p>
      <p class="text-xs text-muted-foreground">13.2% more than last month</p>
    </div>
  </section>
</template>
