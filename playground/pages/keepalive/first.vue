<script setup lang="ts">
definePageMeta({ keepalive: true })
const count = ref(0)
const activated = ref(0)
onActivated(() => activated.value++)
useI18nHead(() => ({ meta: [{ name: 'bench-keepalive', content: 'first' }] }))
</script>

<template>
  <BenchPage name="keepalive-first">
    <R id="keepalive-title" :v="$t('title')" />
    <R id="keepalive-count" :v="count" />
    <R id="keepalive-activated" :v="activated" />
    <button data-testid="keepalive-inc" @click="count++">+1</button>
    <i18n-link data-testid="keepalive-second" to="/keepalive/second">second</i18n-link>
    <i18n-link data-testid="keepalive-slug" to="/keepalive/slug/one">slug</i18n-link>
  </BenchPage>
</template>
