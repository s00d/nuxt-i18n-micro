<script setup lang="ts">
const chunks = useState<string[]>('bench-chunks', () => [])
</script>

<template>
  <BenchPage name="data-loading-a">
    <R id="data-key" :v="$t('page_title')" />
    <ClientOnly><R id="chunks-count" :v="chunks.length" /></ClientOnly>
    <i18n-link data-testid="data-back" to="/data-loading">back</i18n-link>
  </BenchPage>
</template>
