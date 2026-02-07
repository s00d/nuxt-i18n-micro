<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with module imports simulation
const { locales, localeRoutes } = {
  locales: ['en', 'de', 'fr'],
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
  },
}

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes,
})
</script>
