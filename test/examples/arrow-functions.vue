<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with arrow functions and chaining
const processLocales = (rawLocales: string[]) => {
  return rawLocales
    .filter(locale => locale.length === 2)
    .map(locale => locale.toLowerCase())
    .sort()
    .slice(0, 3)
}

const processPaths = (locales: string[]) => {
  return locales.reduce((acc, locale) => {
    acc[locale] = `/${locale === 'en' ? 'welcome' : locale === 'de' ? 'willkommen' : 'bienvenue'}`
    return acc
  }, {} as Record<string, string>)
}

const rawLocales = ['EN', 'de', 'fr', 'invalid', 'es']
const processedLocales = processLocales(rawLocales)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: processedLocales,
  localeRoutes: processPaths(processedLocales),
})
</script>
