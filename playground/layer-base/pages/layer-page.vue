<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({ localeRoutes: { de: '/schicht' } })
</script>

<template>
  <BenchPage name="layer-page">
    <R id="layer-page-key" :v="$t('page_title')" />
    <R id="layer-page-de" :v="$localePath('/layer-page', 'de')" />
  </BenchPage>
</template>
