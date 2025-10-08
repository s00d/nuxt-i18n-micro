<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with BigInt and Number methods
const localeCount = BigInt(3)
const locales = ['en', 'de', 'fr'].slice(0, Number(localeCount))

const _pathCount = Number.parseInt('3', 10)
const localeRoutes = {
  en: '/welcome',
  de: '/willkommen',
  fr: '/bienvenue',
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes,
})
</script>
