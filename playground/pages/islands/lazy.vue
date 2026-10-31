<script setup lang="ts">
const { $getLocale } = useNuxtApp()
</script>

<template>
  <BenchPage name="islands-lazy">
    <NuxtIsland name="BenchIsland" lazy :props="{ variant: 'nuxt-island-lazy', locale: $getLocale() }" />
  </BenchPage>
</template>
