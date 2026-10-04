<template>
  <div class="mx-auto max-w-2xl px-5 py-16">
    <UiCard>
      <UiCardHeader>
        <div class="flex items-center gap-4">
          <UiAvatar class="size-12">
            <UiAvatarImage v-if="user?.avatar" :src="user.avatar" :alt="user.name" />
            <UiAvatarFallback>{{ initials }}</UiAvatarFallback>
          </UiAvatar>
          <div>
            <UiCardTitle>{{ user?.name }}</UiCardTitle>
            <UiCardDescription>{{ user?.email }}</UiCardDescription>
          </div>
        </div>
      </UiCardHeader>
      <UiCardContent class="text-sm text-muted-foreground">
        Auth is working. The real dashboard (sidebar, charts, tables) arrives in the next phase.
      </UiCardContent>
      <UiCardFooter class="gap-2">
        <UiButton variant="outline" @click="logout">
          <Icon name="lucide:log-out" />
          Sign out
        </UiButton>
        <ColorModeToggle />
      </UiCardFooter>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Dashboard" });

  const { user, logout } = useAuth();

  const initials = computed(() =>
    (user.value?.name ?? "")
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  );
</script>
