<script setup lang="ts">
const shown = ref(false)
</script>

<template>
  <BenchPage name="lazy-component">
    <button data-testid="lazy-show" @click="shown = true">show</button>
    <LazyBenchLazy v-if="shown" mode="on-demand" />
  </BenchPage>
</template>
