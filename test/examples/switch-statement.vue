<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with switch statement
const getLocalePath = (locale: string) => {
  switch (locale) {
    case 'en':
      return '/welcome'
    case 'de':
      return '/willkommen'
    case 'fr':
      return '/bienvenue'
    default:
      return `/${locale}`
  }
}

const locales = ['en', 'de', 'fr']

$defineI18nRoute({
  locales: locales,
  localeRoutes: locales.reduce((acc, locale) => {
    acc[locale] = getLocalePath(locale)
    return acc
  }, {} as Record<string, string>)
})
</script>
