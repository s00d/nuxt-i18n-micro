<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <BenchPage name="rr-wild"><R id="rr-wild" :v="route.params.rest" /></BenchPage>
</template>
