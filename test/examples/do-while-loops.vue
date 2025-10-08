<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">/* eslint-disable */
// @ts-nocheck
// Test with do-while loops
let locales: string[] = []
let localeRoutes: Record<string, string> = {}

let i = 0
const localeCodes = ['en', 'de', 'fr']
do {
  locales.push(localeCodes[i])
  i++
} while (i < localeCodes.length)

let j = 0
do {
  const locale = locales[j]
  localeRoutes[locale] = `/${locale === 'en' ? 'welcome' : locale === 'de' ? 'willkommen' : 'bienvenue'}`
  j++
} while (j < locales.length)

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes
})
</script>
