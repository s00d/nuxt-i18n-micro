<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <BenchPage name="mixed-a-b">
    <R id="mixed-a" :v="route.params.a" />
    <R id="mixed-b" :v="route.params.b" />
  </BenchPage>
</template>
