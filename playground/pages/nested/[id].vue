<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div data-testid="nested-id-page"><R id="nested-id" :v="route.params.id" /></div>
</template>
