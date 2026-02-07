<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with computed property names
const locale = 'en'
const path = 'welcome'

// @ts-expect-error
$defineI18nRoute({
  locales: [locale, 'de', 'fr'],
  localeRoutes: {
    [locale]: `/${path}`,
    de: '/willkommen',
    fr: '/bienvenue',
  },
})
</script>
