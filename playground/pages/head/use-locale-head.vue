<script setup lang="ts">
const { metaObject, updateMeta, build } = useLocaleHead({
  addSeoAttributes: true,
  addDirAttribute: true,
  identifierAttribute: 'id',
  baseUrl: 'https://bench.example',
})
useHead(metaObject)
const built = computed(() => build())
</script>

<template>
  <BenchPage name="head-use-locale-head">
    <button data-testid="update-meta" @click="updateMeta()">updateMeta</button>
    <R id="locale-head-object" :v="metaObject" />
    <R id="locale-head-build" :v="built" />
  </BenchPage>
</template>
