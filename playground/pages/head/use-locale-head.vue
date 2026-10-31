<script setup lang="ts">
const { metaObject, updateMeta, build } = useLocaleHead({
  addSeoAttributes: true,
  addDirAttribute: true,
  identifierAttribute: 'id',
  baseUrl: 'https://bench.example',
})
// the cast: the docs' plain `useHead(metaObject)` does not typecheck against unhead 3
useHead(metaObject as Parameters<typeof useHead>[0])
const built = computed(() => build())
</script>

<template>
  <BenchPage name="head-use-locale-head">
    <button data-testid="update-meta" @click="updateMeta()">updateMeta</button>
    <R id="locale-head-object" :v="metaObject" />
    <R id="locale-head-build" :v="built" />
  </BenchPage>
</template>
