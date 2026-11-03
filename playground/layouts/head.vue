<script setup lang="ts">
useI18nHead(() => ({ meta: [{ name: 'bench-layout', content: 'layout-head' }] }))
</script>

<template>
  <div data-testid="layout-head">
    <BenchState layout="head" />
    <slot />
  </div>
</template>
