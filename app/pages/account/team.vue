<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Team members</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage who has access to your store and what they can do.
        </p>
      </div>
      <UiButton @click="inviting = true">
        <Icon name="lucide:user-plus" />
        Invite member
      </UiButton>
    </div>

    <UiTabs v-model="tab">
      <UiTabsList>
        <UiTabsTrigger value="members" class="gap-2">
          Members
          <UiBadge v-if="members" variant="secondary" size="sm">{{ members.length }}</UiBadge>
        </UiTabsTrigger>
        <UiTabsTrigger value="invitations" class="gap-2">
          Invitations
          <UiBadge v-if="pendingCount" variant="warning" size="sm">{{ pendingCount }}</UiBadge>
        </UiTabsTrigger>
      </UiTabsList>
    </UiTabs>

    <TeamMembersTab
      v-if="tab === 'members'"
      :members="members"
      :error="membersError"
      @retry="refreshMembers()"
      @changed="refreshMembers()"
      @remove="removing = { id: $event.id, label: $event.name }"
    />
    <TeamInvitationsTab
      v-else
      :invitations="invitations"
      :error="invitationsError"
      @retry="refreshInvitations()"
      @changed="refreshAll()"
    />

    <TeamInviteDialog
      :open="inviting"
      @close="inviting = false"
      @invited="
        refreshInvitations();
        tab = 'invitations';
      "
    />
    <ResourceDeleteDialog
      resource="staff"
      :record="removing"
      @close="removing = null"
      @deleted="
        removing = null;
        refreshMembers();
      "
    />
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Team members" });

  const tab = useQueryParam<"members" | "invitations">("tab", "members", [
    "members",
    "invitations",
  ]);
  const inviting = ref(false);
  const removing = ref<{ id: string; label: string } | null>(null);

  // The whole team and every invitation are small lists, so they are fetched once here and
  // searched and filtered in the tabs.
  const {
    data: staff,
    error: membersError,
    refresh: refreshMembers,
  } = useFetch<Paginated<StaffMember>>("/api/staff", {
    key: "team-members",
    query: { pageSize: 100, sort: "name", order: "asc" },
    server: false,
  });
  const {
    data: invitations,
    error: invitationsError,
    refresh: refreshInvitations,
  } = useFetch<Invitation[]>("/api/team/invitations", { key: "team-invitations", server: false });

  const members = computed(() => staff.value?.items);
  const pendingCount = computed(
    () => invitations.value?.filter((invitation) => invitation.status === "pending").length ?? 0
  );

  // Accepting an invitation adds a member, so both lists can change at once.
  const refreshAll = () => Promise.all([refreshInvitations(), refreshMembers()]);
</script>
