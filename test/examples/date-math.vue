<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with Date and Math objects
const now = new Date()
const _randomSeed = Math.floor(Math.random() * 1000)

const locales = ['en', 'de', 'fr'].filter((_, index) => Math.abs(Math.sin(now.getTime() + index)) > 0.5)

const localeRoutes = locales.reduce(
  (acc, locale, _index) => {
    acc[locale] = `/${locale === 'en' ? 'welcome' : locale === 'de' ? 'willkommen' : 'bienvenue'}`
    return acc
  },
  {} as Record<string, string>,
)

// @ts-expect-error
$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes,
})
</script>
