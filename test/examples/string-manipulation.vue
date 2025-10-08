<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with regex and string manipulation
const localeString = 'en,de,fr,es'
const locales = localeString.split(',').map(locale => locale.trim())

const pathString = 'welcome,willkommen,bienvenue,bienvenido'
const paths = pathString.split(',').map(path => `/${path}`)

$defineI18nRoute({
  locales: locales,
  localeRoutes: locales.reduce((acc, locale, index) => {
    acc[locale] = paths[index] || `/${locale}`
    return acc
  }, {} as Record<string, string>)
})
</script>
