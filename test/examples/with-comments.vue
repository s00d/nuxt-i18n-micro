<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Edge case: with comments and extra whitespace
$defineI18nRoute({
  // This is a comment
  locales: [
    'en', // English
    'de', // German
    'ru'  // Russian
  ],
  localeRoutes: {
    'en': '/welcome',
    'de': '/willkommen',
    'ru': '/dobro-pozhalovat'
  }
})
</script>
