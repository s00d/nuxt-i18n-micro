<script setup lang="ts">
const calls = useState<string[]>('bench-register', () => [])
const plugin = useState('bench-plugin')
</script>

<template>
  <BenchPage name="t-hooks">
    <ClientOnly><R id="hook-calls" :v="calls" /></ClientOnly>
    <R id="hook-marker" :v="$t('registered.marker')" />
    <R id="plugin-state" :v="plugin" />
  </BenchPage>
</template>
