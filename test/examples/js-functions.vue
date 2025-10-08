<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with computed values
const getLocales = () => ['en', 'de', 'ru']
const getPaths = () => ({
  en: '/welcome',
  de: '/willkommen',
  ru: '/dobro-pozhalovat'
})

$defineI18nRoute({
  locales: getLocales(),
  localeRoutes: getPaths()
})
</script>
