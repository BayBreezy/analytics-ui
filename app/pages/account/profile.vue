<template>
  <div class="mx-auto w-full max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Profile</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Manage your personal details, password and signed-in devices.
      </p>
    </div>

    <ProfilePersonalInfoCard />
    <ProfilePasswordCard />
    <ProfileSessionsCard />
    <ProfileDangerCard />
  </div>
</template>

<script lang="ts" setup>
  useSeoMeta({ title: "Profile" });
</script>
