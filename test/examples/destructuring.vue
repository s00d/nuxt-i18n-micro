<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with destructuring
const config = {
  locales: ['en', 'de', 'fr'],
  paths: {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue'
  }
}

const { locales, paths: localeRoutes } = config

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes
})
</script>
