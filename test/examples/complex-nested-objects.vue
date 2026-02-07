<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with complex nested objects
const config = {
  locales: {
    'en-us': {
      path: '/welcome',
      meta: {
        title: 'Welcome',
        description: 'Welcome to our site',
        keywords: ['welcome', 'home', 'main'],
      },
    },
    'de-de': {
      path: '/willkommen',
      meta: {
        title: 'Willkommen',
        description: 'Willkommen auf unserer Website',
        keywords: ['willkommen', 'startseite', 'hauptseite'],
      },
    },
  },
}

// @ts-expect-error
$defineI18nRoute(config)
</script>
