<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with try-catch and error handling
let locales: string[] = []
let localeRoutes: Record<string, string> = {}

try {
  locales = ['en', 'de', 'fr']
  localeRoutes = {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
  }
} catch (error) {
  console.error('Error setting up locales:', error)
  locales = ['en']
  localeRoutes = { en: '/welcome' }
}

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes,
})
</script>
