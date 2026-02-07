<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with nested ternary operators
const getLocaleInfo = (locale: string) => {
  return locale === 'en' ? 'welcome' : locale === 'de' ? 'willkommen' : locale === 'fr' ? 'bienvenue' : locale === 'es' ? 'bienvenido' : 'welcome'
}

const locales = ['en', 'de', 'fr', 'es']

$defineI18nRoute({
  locales: locales,
  localeRoutes: locales.reduce(
    (acc, locale) => {
      acc[locale] = `/${getLocaleInfo(locale)}`
      return acc
    },
    {} as Record<string, string>,
  ),
})
</script>
