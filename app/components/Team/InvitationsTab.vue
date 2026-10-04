<template>
  <UiCard class="gap-0 overflow-hidden py-0">
    <AppErrorState
      v-if="error && !invitations"
      what="invitations"
      class="py-10"
      @retry="emit('retry')"
    />
    <ul v-else-if="!invitations" class="divide-y">
      <li v-for="n in 4" :key="n" class="flex items-center gap-4 p-4">
        <UiSkeleton class="size-10 rounded-full" />
        <div class="flex-1 space-y-2">
          <UiSkeleton class="h-4 w-48" />
          <UiSkeleton class="h-3 w-32" />
        </div>
      </li>
    </ul>
    <UiEmpty v-else-if="!invitations.length" class="min-h-48 p-6">
      <UiEmptyHeader>
        <UiEmptyMedia variant="icon"><Icon name="lucide:mail-plus" /></UiEmptyMedia>
        <UiEmptyTitle>No invitations yet</UiEmptyTitle>
        <UiEmptyDescription>Invite someone to join your team.</UiEmptyDescription>
      </UiEmptyHeader>
    </UiEmpty>
    <ul v-else class="divide-y">
      <li
        v-for="invitation in invitations"
        :key="invitation.id"
        class="flex flex-wrap items-center gap-x-4 gap-y-3 p-4"
      >
        <div class="flex min-w-0 flex-1 basis-60 items-center gap-3">
          <UiFancyIcon icon="lucide:mail" size="md" theme="light" color="gray" />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">{{ invitation.email }}</p>
            <p class="truncate text-xs text-muted-foreground">
              Invited by {{ invitation.invitedBy }} · {{ formatRelative(invitation.createdAt) }}
            </p>
          </div>
        </div>
        <UiBadge variant="outline" class="capitalize">{{ invitation.role }}</UiBadge>
        <UiBadge :variant="INVITATION_VARIANTS[invitation.status]" class="capitalize">
          {{ invitation.status }}
        </UiBadge>
        <span class="hidden w-36 text-sm text-muted-foreground lg:block">
          <template v-if="invitation.status === 'pending'">
            Expires {{ formatRelative(invitation.expiresAt) }}
          </template>
          <template v-else-if="invitation.status === 'expired'">
            Expired {{ formatRelative(invitation.expiresAt) }}
          </template>
        </span>
        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton
              variant="ghost"
              size="icon-sm"
              :aria-label="`Actions for ${invitation.email}`"
              :disabled="invitation.status === 'accepted' || invitation.status === 'cancelled'"
              :loading="busy === invitation.id"
            >
              <Icon name="lucide:ellipsis" />
            </UiButton>
          </UiDropdownMenuTrigger>
          <UiDropdownMenuContent align="end" class="w-56">
            <UiDropdownMenuItem @select="resend(invitation)">
              <Icon name="lucide:send" />
              Resend invitation
            </UiDropdownMenuItem>
            <UiDropdownMenuItem @select="copyLink(invitation)">
              <Icon name="lucide:link" />
              Copy invite link
            </UiDropdownMenuItem>
            <UiDropdownMenuItem v-if="invitation.status === 'pending'" @select="accept(invitation)">
              <Icon name="lucide:user-check" />
              Mark as accepted (demo)
            </UiDropdownMenuItem>
            <UiDropdownMenuSeparator />
            <UiDropdownMenuItem variant="destructive" @select="askToCancel(invitation)">
              <Icon name="lucide:circle-x" />
              Cancel invitation
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </li>
    </ul>

    <AppConfirmDialog
      :open="confirmOpen"
      title="Cancel this invitation?"
      :description="`${cancelling?.email ?? ''} won't be able to join with the link they were sent.`"
      confirm-label="Cancel invitation"
      destructive
      @close="confirmOpen = false"
      @confirm="cancel"
    />
  </UiCard>
</template>

<script lang="ts" setup>
  defineProps<{ invitations?: Invitation[]; error?: unknown }>();
  const emit = defineEmits<{ retry: []; changed: [] }>();

  const INVITATION_VARIANTS = {
    pending: "warning",
    accepted: "success",
    cancelled: "secondary",
    expired: "error",
  } as const satisfies Record<InvitationStatus, string>;

  // A plain string path: Nuxt's typed route matching gives up on these template-literal URLs.
  const call = (path: string, method: "POST" | "DELETE") => $fetch<unknown>(path, { method });

  const busy = ref("");
  // The invitation being cancelled stays set while the dialog closes, so confirming can still read it.
  const cancelling = ref<Invitation | null>(null);
  const confirmOpen = ref(false);
  const askToCancel = (invitation: Invitation) => {
    cancelling.value = invitation;
    confirmOpen.value = true;
  };

  async function run(
    invitation: Invitation,
    request: () => Promise<unknown>,
    success: string,
    failure: string
  ) {
    busy.value = invitation.id;
    try {
      await request();
      useSonner(success.split("|")[0]!, { description: success.split("|")[1] });
      emit("changed");
    } catch (error) {
      useSonner.error(failure, { description: getErrorMessage(error) });
    } finally {
      busy.value = "";
    }
  }

  const resend = (invitation: Invitation) =>
    run(
      invitation,
      () => call(`/api/team/invitations/${invitation.id}/resend`, "POST"),
      `Invitation resent|${invitation.email} has 7 more days to join.`,
      "Couldn't resend the invitation"
    );

  const accept = (invitation: Invitation) =>
    run(
      invitation,
      () => call(`/api/team/invitations/${invitation.id}/accept`, "POST"),
      `Invitation accepted|${invitation.email} is now on your team.`,
      "Couldn't accept the invitation"
    );

  function cancel() {
    const invitation = cancelling.value;
    confirmOpen.value = false;
    if (!invitation) return;
    return run(
      invitation,
      () => call(`/api/team/invitations/${invitation.id}`, "DELETE"),
      `Invitation cancelled|The invitation for ${invitation.email} was cancelled.`,
      "Couldn't cancel the invitation"
    );
  }

  const { copy } = useClipboard();
  async function copyLink(invitation: Invitation) {
    await copy(`${window.location.origin}/register?invite=${invitation.id}`);
    useSonner("Link copied", { description: "Send it to the person you invited." });
  }
</script>
