<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="ghost" size="icon-sm" :aria-label="`Actions for ${label}`">
        <Icon name="lucide:ellipsis" />
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end">
      <UiDropdownMenuItem as-child>
        <NuxtLink :to="`${base}/${id}`">
          <Icon name="lucide:eye" />
          View
        </NuxtLink>
      </UiDropdownMenuItem>
      <template v-if="canWrite">
        <UiDropdownMenuItem as-child>
          <NuxtLink :to="`${base}/${id}/edit`">
            <Icon name="lucide:pencil" />
            Edit
          </NuxtLink>
        </UiDropdownMenuItem>
        <UiDropdownMenuSeparator />
        <UiDropdownMenuItem variant="destructive" @select="emit('delete')">
          <Icon name="lucide:trash-2" />
          Delete
        </UiDropdownMenuItem>
      </template>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>

<script lang="ts" setup>
  const props = defineProps<{ resource: ResourceName; id: string; label: string }>();
  const emit = defineEmits<{ delete: [] }>();

  const base = computed(() => RESOURCES[props.resource].base);
  const { canWrite } = useResourcePermissions(() => props.resource);
</script>
