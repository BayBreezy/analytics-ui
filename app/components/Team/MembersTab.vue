<template>
  <UiCard class="gap-0 overflow-hidden py-0">
    <div class="flex flex-wrap items-center gap-3 border-b p-4">
      <div class="relative w-full sm:w-72">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/70"
        />
        <UiInput
          v-model="search"
          class="pl-9"
          type="search"
          placeholder="Search team members"
          aria-label="Search team members"
        />
      </div>
      <UiNativeSelect v-model="role" class="w-full sm:w-44" aria-label="Filter by role">
        <option value="">All roles</option>
        <option v-for="value in STAFF_ROLES" :key="value" :value="value">
          {{ titleCase(value) }}
        </option>
      </UiNativeSelect>
    </div>

    <AppErrorState
      v-if="error && !members"
      what="team members"
      class="py-10"
      @retry="emit('retry')"
    />
    <ul v-else-if="!members" class="divide-y">
      <li v-for="n in 5" :key="n" class="flex items-center gap-4 p-4">
        <UiSkeleton class="size-10 rounded-full" />
        <div class="flex-1 space-y-2">
          <UiSkeleton class="h-4 w-40" />
          <UiSkeleton class="h-3 w-56" />
        </div>
      </li>
    </ul>
    <UiEmpty v-else-if="!visible.length" class="min-h-48 p-6">
      <UiEmptyHeader>
        <UiEmptyMedia variant="icon"><Icon name="lucide:users-round" /></UiEmptyMedia>
        <UiEmptyTitle>No team members found</UiEmptyTitle>
        <UiEmptyDescription>Try a different search or role.</UiEmptyDescription>
      </UiEmptyHeader>
    </UiEmpty>
    <ul v-else class="divide-y">
      <li
        v-for="member in visible"
        :key="member.id"
        class="flex flex-wrap items-center gap-x-4 gap-y-3 p-4"
      >
        <NuxtLink :to="`/staff/${member.id}`" class="min-w-0 flex-1 basis-60">
          <UiAvatarLabelGroup
            :src="member.avatar"
            :alt="member.name"
            :fallback="initialsOf(member.name)"
            :title="member.name"
            :subtitle="member.email"
          />
        </NuxtLink>
        <UiBadge variant="outline" class="capitalize">{{ member.role }}</UiBadge>
        <UiBadge :variant="member.status === 'active' ? 'success' : 'secondary'" class="capitalize">
          {{ member.status }}
        </UiBadge>
        <span class="hidden w-36 text-sm whitespace-nowrap text-muted-foreground lg:block">
          Joined {{ formatDate(member.createdAt) }}
        </span>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton
              variant="ghost"
              size="icon-sm"
              :aria-label="`Actions for ${member.name}`"
              :loading="busy === member.id"
            >
              <Icon name="lucide:ellipsis" />
            </UiButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end" class="w-52">
            <UiDropdownMenuSub>
              <UiDropdownMenuSubTrigger>
                <Icon name="lucide:shield" />
                Change role
              </UiDropdownMenuSubTrigger>
              <UiDropdownMenuSubContent>
                <UiDropdownMenuItem
                  v-for="value in STAFF_ROLES.filter((r) => r !== member.role)"
                  :key="value"
                  @select="change(member, { role: value }, `${member.name} is now ${value}`)"
                >
                  {{ titleCase(value) }}
                </UiDropdownMenuItem>
              </UiDropdownMenuSubContent>
            </UiDropdownMenuSub>
            <UiDropdownMenuItem
              v-if="member.status === 'active'"
              @select="change(member, { status: 'inactive' }, `${member.name} was deactivated`)"
            >
              <Icon name="lucide:user-x" />
              Deactivate
            </UiDropdownMenuItem>
            <UiDropdownMenuItem
              v-else
              @select="change(member, { status: 'active' }, `${member.name} was reactivated`)"
            >
              <Icon name="lucide:user-check" />
              Reactivate
            </UiDropdownMenuItem>
            <UiDropdownMenuSeparator />
            <UiDropdownMenuItem variant="destructive" @select="emit('remove', member)">
              <Icon name="lucide:trash-2" />
              Remove from team
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </li>
    </ul>
  </UiCard>
</template>

<script lang="ts" setup>
  const props = defineProps<{ members?: StaffMember[]; error?: unknown }>();
  const emit = defineEmits<{ retry: []; changed: []; remove: [member: StaffMember] }>();

  const search = ref("");
  const role = ref("");

  const visible = computed(() => {
    const needle = search.value.trim().toLowerCase();
    return (props.members ?? []).filter(
      (member) =>
        (!role.value || member.role === role.value) &&
        (!needle || `${member.name} ${member.email}`.toLowerCase().includes(needle))
    );
  });

  const busy = ref("");
  async function change(member: StaffMember, patch: Partial<StaffMember>, message: string) {
    busy.value = member.id;
    try {
      await $fetch(`/api/staff/${member.id}`, { method: "PUT", body: patch });
      useSonner("Team updated", { description: message });
      emit("changed");
    } catch (error) {
      useSonner.error("Couldn't update the team member", { description: getErrorMessage(error) });
    } finally {
      busy.value = "";
    }
  }
</script>
