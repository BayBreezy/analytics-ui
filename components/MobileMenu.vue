<template>
  <div>
    <!-- Used to animate the entire thing -->
    <HTransitionRoot appear :show="isOpen" as="div">
      <!-- Parent dialog  -->
      <HDialog as="div" @close="isOpen = false" class="fixed inset-0 z-50 flex justify-start">
        <!-- Transition for overlay/backdrop -->
        <HTransitionChild
          as="div"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <!-- The actual backdrop -->
          <div class="fixed inset-0 bg-black/25 backdrop-blur" />
        </HTransitionChild>

        <HTransitionChild
          as="div"
          enter="duration-300 ease-out"
          enter-from="opacity-0 -translate-x-full"
          leave="duration-200 ease-in"
          leave-to="opacity-0 -translate-x-full"
        >
          <HDialogPanel class="relative h-dvh w-[320px] p-3">
            <div class="absolute -right-10 top-4 z-20">
              <button
                @click="isOpen = false"
                aria-label="Close menu"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background"
              >
                <span class="sr-only">Button used to close menu</span>
                <Icon name="heroicons:x-mark" />
              </button>
            </div>
            <Sidebar class="sticky top-0 h-full w-full max-w-sm" />
          </HDialogPanel>
        </HTransitionChild>
      </HDialog>
    </HTransitionRoot>
  </div>
</template>

<script setup>
  const isOpen = defineModel();
</script>
