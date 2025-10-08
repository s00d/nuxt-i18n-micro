<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with Proxy objects
const localeConfig = {
  locales: ['en', 'de', 'fr'],
  paths: {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue'
  }
}

const proxy = new Proxy(localeConfig, {
  get(target, prop) {
    if (prop === 'localeRoutes') {
      return target.paths
    }
    return target[prop as keyof typeof target]
  }
})

$defineI18nRoute({
  locales: proxy.locales,
  localeRoutes: proxy.localeRoutes
})
</script>
