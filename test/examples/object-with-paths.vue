<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Object format with custom paths
$defineI18nRoute({
  locales: {
    en: {
      path: '/welcome',
    },
    de: {
      path: '/willkommen',
    },
    ru: {
      path: '/dobro-pozhalovat',
    },
  },
})
</script>
