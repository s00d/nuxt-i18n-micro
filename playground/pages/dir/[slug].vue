<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <BenchPage name="dir-slug">
    <R id="dir-slug" :v="route.params.slug" />
    <R id="dir-path-de" :v="$localePath({ name: 'dir-slug', params: { slug: 'x' } }, 'de')" />
  </BenchPage>
</template>
