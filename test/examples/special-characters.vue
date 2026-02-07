<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with special characters in paths
$defineI18nRoute({
  locales: ['en', 'de', 'fr'],
  localeRoutes: {
    en: '/welcome-to-our-site',
    de: '/willkommen-auf-unserer-website',
    fr: '/bienvenue-sur-notre-site',
  },
})
</script>
