<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script>
/* eslint-disable */
// @ts-nocheck
// Test with plain JavaScript (no TypeScript)
const locales = ['en', 'de', 'fr']
const localeRoutes = {
  'en': '/welcome',
  'de': '/willkommen',
  'fr': '/bienvenue'
}

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes
})
</script>
