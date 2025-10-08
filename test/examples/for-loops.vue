<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with for loops
const locales: string[] = []
const localeRoutes: Record<string, string> = {}

for (let i = 0; i < 3; i++) {
  const localeCodes = ['en', 'de', 'fr']
  locales.push(localeCodes[i])
}

for (const locale of locales) {
  localeRoutes[locale] = `/${locale === 'en' ? 'welcome' : locale === 'de' ? 'willkommen' : 'bienvenue'}`
}

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes
})
</script>
