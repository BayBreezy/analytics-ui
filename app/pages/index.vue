<template>
  <div />
</template>

<script lang="ts" setup>
  // The auth middleware then decides between the dashboard and the login page.
  definePageMeta({ redirect: "/dashboard" });
</script>
