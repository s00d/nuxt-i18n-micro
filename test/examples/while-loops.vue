<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with while loops
let locales: string[] = []
let localeRoutes: Record<string, string> = {}

let i = 0
const localeCodes = ['en', 'de', 'fr']
while (i < localeCodes.length) {
  locales.push(localeCodes[i])
  i++
}

let j = 0
while (j < locales.length) {
  const locale = locales[j]
  localeRoutes[locale] = `/${locale === 'en' ? 'welcome' : locale === 'de' ? 'willkommen' : 'bienvenue'}`
  j++
}

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes
})
</script>
