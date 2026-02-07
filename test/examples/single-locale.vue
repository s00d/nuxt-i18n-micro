<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with single locale
$defineI18nRoute({
  locales: ['en'],
  localeRoutes: {
    en: '/welcome',
  },
})
</script>
