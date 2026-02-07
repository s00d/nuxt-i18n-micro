<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with Promise simulation
const localePromise = Promise.resolve(['en', 'de', 'fr'])
const pathPromise = Promise.resolve({
  en: '/welcome',
  de: '/willkommen',
  fr: '/bienvenue',
})

// Note: This won't work in real scenario, but tests parsing
const locales = await localePromise
const localeRoutes = await pathPromise

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes,
})
</script>
