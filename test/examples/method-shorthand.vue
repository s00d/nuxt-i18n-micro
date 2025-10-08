<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with method shorthand
const config = {
  locales: ['en', 'de', 'fr'],
  localeRoutes: {
    'en': '/welcome',
    'de': '/willkommen',
    'fr': '/bienvenue'
  },
  getLocales() {
    return this.locales
  },
  getPaths() {
    return this.localeRoutes
  }
}

$defineI18nRoute({
  locales: config.getLocales(),
  localeRoutes: config.getPaths()
})
</script>
