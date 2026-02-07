<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Complex format with localeRoutes
$defineI18nRoute({
  locales: ['en', 'de'],
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen',
  },
})
</script>
