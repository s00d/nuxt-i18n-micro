<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with mixed quotes
$defineI18nRoute({
  locales: ['en', "de", 'fr'],
  localeRoutes: {
    'en': "/welcome",
    "de": '/willkommen',
    'fr': "/bienvenue"
  }
})
</script>
