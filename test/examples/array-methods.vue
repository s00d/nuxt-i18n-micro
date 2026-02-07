<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with array methods
const allLocales = ['en', 'de', 'fr', 'es', 'it', 'pt']
const supportedLocales = allLocales.filter((locale) => ['en', 'de', 'fr'].includes(locale))

// @ts-expect-error
$defineI18nRoute({
  locales: supportedLocales,
  localeRoutes: supportedLocales.reduce(
    (acc, locale) => {
      acc[locale] = `/${locale === 'en' ? 'welcome' : locale === 'de' ? 'willkommen' : 'bienvenue'}`
      return acc
    },
    {} as Record<string, string>,
  ),
})
</script>
