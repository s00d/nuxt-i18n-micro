<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <BenchPage name="linked-id">
    <R id="linked-id" :v="route.params.id" />
    <R id="linked-title" :v="$t('page_title')" />
  </BenchPage>
</template>
