<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <BenchPage name="ext">
    <R id="ext-name" :v="String(route.name)" />
    <R id="ext-tag" :v="route.params.tag" />
    <R id="ext-title" :v="$t('title')" />
  </BenchPage>
</template>
