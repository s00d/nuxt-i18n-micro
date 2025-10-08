<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with async/await
const fetchLocales = async () => {
  return ['en', 'de', 'fr']
}

const fetchPaths = async () => {
  return {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
  }
}

// Note: This won't work in real scenario, but tests parsing
const locales = await fetchLocales()
const paths = await fetchPaths()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: locales,
  localeRoutes: paths,
})
</script>
