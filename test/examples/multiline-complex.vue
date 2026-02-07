<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Edge case: multiline and complex formatting
$defineI18nRoute({
  locales: {
    'en-us': {
      path: '/welcome',
      meta: {
        title: 'Welcome',
        description: 'Welcome to our site',
      },
    },
    'de-de': {
      path: '/willkommen',
      meta: {
        title: 'Willkommen',
        description: 'Willkommen auf unserer Website',
      },
    },
  },
  localeRoutes: {
    'en-us': '/welcome',
    'de-de': '/willkommen',
  },
})
</script>
