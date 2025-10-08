<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with recursive function
function generateLocales(count: number): string[] {
  if (count <= 0) return []
  const locales = ['en', 'de', 'fr']
  return [locales[count - 1], ...generateLocales(count - 1)].filter(Boolean)
}

function generatePaths(locales: string[]): Record<string, string> {
  if (locales.length === 0) return {}
  const [first, ...rest] = locales
  const paths = {
    'en': '/welcome',
    'de': '/willkommen',
    'fr': '/bienvenue'
  }
  return {
    [first]: paths[first as keyof typeof paths] || `/${first}`,
    ...generatePaths(rest)
  }
}

const locales = generateLocales(3)
const localeRoutes = generatePaths(locales)

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes
})
</script>
