<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <BenchPage name="opt-page"><R id="opt-page" :v="route.params.page ?? ''" /></BenchPage>
</template>
