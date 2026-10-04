<template>
  <UiCard class="max-w-2xl">
    <UiCardContent class="space-y-6">
      <div class="flex items-center gap-4">
        <UiAvatar
          :src="record.avatar"
          :alt="record.name"
          :fallback="initialsOf(record.name)"
          class="size-16"
        />
        <div class="min-w-0">
          <p class="truncate text-lg font-semibold">{{ record.name }}</p>
          <div class="mt-1 flex gap-2">
            <UiBadge variant="outline" class="capitalize">{{ record.role }}</UiBadge>
            <UiBadge
              :variant="record.status === 'active' ? 'success' : 'secondary'"
              class="capitalize"
            >
              {{ record.status }}
            </UiBadge>
          </div>
        </div>
      </div>
      <dl class="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        <div v-for="item in details" :key="item.label" class="flex items-start gap-3">
          <Icon :name="item.icon" class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div class="min-w-0">
            <dt class="text-muted-foreground">{{ item.label }}</dt>
            <dd class="mt-0.5 font-medium break-words">{{ item.value }}</dd>
          </div>
        </div>
      </dl>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const props = defineProps<{ record: StaffMember }>();

  const details = computed(() => [
    { label: "Email", icon: "lucide:mail", value: props.record.email },
    { label: "Phone", icon: "lucide:phone", value: props.record.phone },
    { label: "Role", icon: "lucide:shield", value: titleCase(props.record.role) },
    { label: "Joined", icon: "lucide:calendar", value: formatDate(props.record.createdAt) },
  ]);
</script>
