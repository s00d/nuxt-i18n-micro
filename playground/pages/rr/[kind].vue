<script setup lang="ts">
const route = useRoute()
const { data: rendered } = await useAsyncData('bench-rendered', () => Promise.resolve(new Date().toISOString()))
</script>

<template>
  <BenchPage name="rr-kind">
    <R id="rr-kind" :v="route.params.kind" />
    <R id="rr-rendered" :v="rendered" loose />
    <R id="rr-title" :v="$t('title')" />
  </BenchPage>
</template>
