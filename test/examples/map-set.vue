<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with Map and Set
const localeSet = new Set(['en', 'de', 'fr'])
const pathMap = new Map([
  ['en', '/welcome'],
  ['de', '/willkommen'],
  ['fr', '/bienvenue']
])

$defineI18nRoute({
  locales: Array.from(localeSet),
  localeRoutes: Object.fromEntries(pathMap)
})
</script>
