<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with JSON parsing
const localeConfig = JSON.parse('{"locales":["en","de","fr"],"paths":{"en":"/welcome","de":"/willkommen","fr":"/bienvenue"}}')

$defineI18nRoute({
  locales: localeConfig.locales,
  localeRoutes: localeConfig.paths
})
</script>
