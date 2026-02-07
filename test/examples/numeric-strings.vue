<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with numeric strings
$defineI18nRoute({
  locales: ['1', '2', '3'],
  localeRoutes: {
    '1': '/welcome',
    '2': '/willkommen',
    '3': '/bienvenue',
  },
})
</script>
