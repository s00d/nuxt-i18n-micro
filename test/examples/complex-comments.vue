<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/*
 * Multi-line comment block
 * This is a complex configuration
 * with multiple locales and paths
 */
// @ts-expect-error
$defineI18nRoute({
  // Single line comment for locales
  locales: [
    'en', // English
    'de', // German
    'fr', // French
  ],
  /* Multi-line comment for localeRoutes */
  localeRoutes: {
    en: '/welcome', // Welcome page
    de: '/willkommen', // Willkommen page
    fr: '/bienvenue', // Bienvenue page
  },
})
</script>
