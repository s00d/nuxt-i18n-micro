<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with JavaScript variables
const locales = ['en', 'de', 'fr']
const customPaths = {
  en: '/welcome',
  de: '/willkommen',
  fr: '/bienvenue',
}

$defineI18nRoute({
  locales: locales,
  localeRoutes: customPaths,
})
</script>
