<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with only localeRoutes property
$defineI18nRoute({
  localeRoutes: {
    'en': '/welcome',
    'de': '/willkommen',
    'fr': '/bienvenue'
  }
})
</script>
