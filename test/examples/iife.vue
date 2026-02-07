<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with IIFE (Immediately Invoked Function Expression)
const config = (() => {
  const locales = ['en', 'de', 'fr']
  const localeRoutes = {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
  }
  return { locales, localeRoutes }
})()

$defineI18nRoute({
  locales: config.locales,
  localeRoutes: config.localeRoutes,
})
</script>
