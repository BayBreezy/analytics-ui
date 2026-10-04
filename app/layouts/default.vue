<template>
  <UiSidebarProvider>
    <AppSidebar />
    <UiSidebarInset>
      <AppHeader />
      <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <slot />
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
