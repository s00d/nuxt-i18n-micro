<script setup lang="ts">
const { $getLocale } = useNuxtApp()
</script>

<template>
  <BenchPage name="islands">
    <BenchIsland variant="no-prop" />
    <BenchIsland variant="prop" :locale="$getLocale()" />
    <NuxtIsland name="BenchIsland" :props="{ variant: 'nuxt-island', locale: $getLocale() }" />
    <BenchIsland variant="slot" :locale="$getLocale()">
      <template #extra
        ><span data-testid="island-slot">{{ $t('title') }}</span></template
      >
    </BenchIsland>
  </BenchPage>
</template>
