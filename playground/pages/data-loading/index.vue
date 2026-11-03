<script setup lang="ts">
const chunks = useState<string[]>('bench-chunks', () => [])
</script>

<template>
  <BenchPage name="data-loading">
    <ClientOnly><R id="chunks-count" :v="chunks.length" /></ClientOnly>
    <ClientOnly>
      <ul data-testid="chunks">
        <li v-for="(chunk, index) in chunks" :key="index" data-testid="chunk">{{ chunk }}</li>
      </ul>
    </ClientOnly>
    <i18n-link data-testid="data-a" to="/data-loading/a">a</i18n-link>
    <i18n-link data-testid="data-b" to="/data-loading/b">b</i18n-link>
    <i18n-link data-testid="data-1k" to="/huge/1k">1k</i18n-link>
  </BenchPage>
</template>
