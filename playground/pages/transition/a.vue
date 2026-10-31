<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'bench-fade', mode: 'out-in' } })
</script>

<template>
  <BenchPage name="transition-a">
    <R id="transition-key" :v="$t('page_title')" />
    <i18n-link data-testid="transition-b" to="/transition/b">b</i18n-link>
  </BenchPage>
</template>

<style>
.bench-fade-enter-active,
.bench-fade-leave-active {
  transition: opacity 0.3s;
}
.bench-fade-enter-from,
.bench-fade-leave-to {
  opacity: 0;
}
</style>
