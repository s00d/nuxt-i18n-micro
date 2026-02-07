<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with Symbol properties
const LOCALE_SYMBOL = Symbol('locale')
const PATH_SYMBOL = Symbol('path')

const config = {
  [LOCALE_SYMBOL]: ['en', 'de', 'fr'],
  [PATH_SYMBOL]: {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
  },
}

$defineI18nRoute({
  locales: config[LOCALE_SYMBOL],
  localeRoutes: config[PATH_SYMBOL],
})
</script>
