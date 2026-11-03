<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'bench-fade', mode: 'out-in' } })
</script>

<template>
  <BenchPage name="transition-b">
    <R id="transition-key" :v="$t('page_title')" />
    <i18n-link data-testid="transition-a" to="/transition/a">a</i18n-link>
  </BenchPage>
</template>
