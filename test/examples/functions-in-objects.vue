<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with functions inside objects
$defineI18nRoute({
  locales: ['en', 'de', 'fr'],
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
  },
  getPath: function (locale: string) {
    return this.localeRoutes[locale] || `/${locale}`
  },
  getLocales: () => ['en', 'de', 'fr'],
})
</script>
