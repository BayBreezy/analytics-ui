<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Active sessions</UiCardTitle>
      <UiCardDescription>Devices that are signed in to your account.</UiCardDescription>
      <UiCardAction v-if="others > 0">
        <UiButton variant="outline" size="sm" :loading="signingOutOthers" @click="signOutOthers">
          Sign out other devices
        </UiButton>
      </UiCardAction>
    </UiCardHeader>
    <UiCardContent>
      <AppErrorState v-if="error" what="your sessions" @retry="refresh()" />
      <div v-else-if="!sessions" class="space-y-3">
        <UiSkeleton v-for="n in 3" :key="n" class="h-14 w-full" />
      </div>
      <ul v-else class="divide-y">
        <li v-for="session in sessions" :key="session.id" class="flex items-center gap-3 py-3">
          <UiFancyIcon
            :icon="session.device.match(/iPhone|iPad/) ? 'lucide:smartphone' : 'lucide:laptop'"
            theme="gradient"
            :color="session.current ? 'success' : 'gray'"
          />
          <div class="min-w-0 flex-1">
            <p class="mb-1 flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span class="truncate">{{ session.device }}</span>
              <UiBadge v-if="session.current" variant="success" size="sm">This device</UiBadge>
            </p>
            <p class="truncate text-xs text-muted-foreground">
              {{ session.browser }} · {{ session.location }} ·
              {{ session.current ? "Active now" : formatRelative(session.lastActiveAt) }}
            </p>
          </div>
          <UiButton
            v-if="!session.current"
            variant="ghost"
            size="sm"
            :loading="signingOut === session.id"
            @click="signOut(session)"
          >
            Sign out
          </UiButton>
        </li>
      </ul>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  const {
    data: sessions,
    error,
    refresh,
  } = useFetch<AccountSession[]>("/api/account/sessions", {
    key: "account-sessions",
    server: false,
  });

  const others = computed(() => sessions.value?.filter((session) => !session.current).length ?? 0);
  const signingOut = ref<string>();
  const signingOutOthers = ref(false);

  async function signOut(session: AccountSession) {
    signingOut.value = session.id;
    try {
      sessions.value = await $fetch<AccountSession[]>(`/api/account/sessions/${session.id}`, {
        method: "DELETE",
      });
      useSonner(`Signed out ${session.device}`);
    } catch (e) {
      useSonner.error("Couldn't sign out that device", { description: getErrorMessage(e) });
    } finally {
      signingOut.value = undefined;
    }
  }

  async function signOutOthers() {
    signingOutOthers.value = true;
    try {
      sessions.value = await $fetch<AccountSession[]>("/api/account/sessions/others", {
        method: "DELETE",
      });
      useSonner("Signed out your other devices");
    } catch (e) {
      useSonner.error("Couldn't sign out your other devices", { description: getErrorMessage(e) });
    } finally {
      signingOutOthers.value = false;
    }
  }
</script>
