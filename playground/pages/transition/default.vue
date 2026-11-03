<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'bench-fade' }, layoutTransition: { name: 'bench-fade' } })
</script>

<template>
  <BenchPage name="transition-default"><R id="transition-key" :v="$t('page_title')" /></BenchPage>
</template>
