<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with spread operator
const baseLocales = ['en', 'de']
const additionalLocales = ['fr', 'es']

$defineI18nRoute({
  locales: [...baseLocales, ...additionalLocales],
  localeRoutes: {
    ...Object.fromEntries(
      ['en', 'de', 'fr', 'es'].map(locale => [
        locale,
        `/${locale === 'en' ? 'welcome' : locale === 'de' ? 'willkommen' : locale === 'fr' ? 'bienvenue' : 'bienvenido'}`
      ])
    )
  }
})
</script>
