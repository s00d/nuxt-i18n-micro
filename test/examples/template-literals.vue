<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with template literals
const baseUrl = '/api'
const locale = 'en'

$defineI18nRoute({
  locales: [`${locale}`, 'de', 'fr'],
  localeRoutes: {
    [`${locale}`]: `${baseUrl}/welcome`,
    de: `${baseUrl}/willkommen`,
    fr: `${baseUrl}/bienvenue`,
  },
})
</script>
