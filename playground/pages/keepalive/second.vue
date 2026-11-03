<script setup lang="ts">
definePageMeta({ keepalive: true })
const count = ref(0)
</script>

<template>
  <BenchPage name="keepalive-second">
    <R id="keepalive-second-title" :v="$t('title')" />
    <R id="keepalive-second-count" :v="count" />
    <button data-testid="keepalive-second-inc" @click="count++">+1</button>
    <i18n-link data-testid="keepalive-first" to="/keepalive/first">first</i18n-link>
  </BenchPage>
</template>
