<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with generator functions
function* localeGenerator() {
  yield 'en'
  yield 'de'
  yield 'fr'
}

function* pathGenerator() {
  yield '/welcome'
  yield '/willkommen'
  yield '/bienvenue'
}

const locales = Array.from(localeGenerator())
const paths = Array.from(pathGenerator())

$defineI18nRoute({
  locales: locales,
  localeRoutes: locales.reduce(
    (acc, locale, index) => {
      acc[locale] = paths[index] || `/${locale}`
      return acc
    },
    {} as Record<string, string>,
  ),
})
</script>
