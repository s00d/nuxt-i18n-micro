<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with nested objects and arrays
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: {
    'en-us': {
      path: '/welcome',
      meta: {
        title: 'Welcome',
        description: 'Welcome to our site',
        keywords: ['welcome', 'home', 'main'],
        social: {
          twitter: '@welcome',
          facebook: 'welcome.page',
        },
      },
    },
    'de-de': {
      path: '/willkommen',
      meta: {
        title: 'Willkommen',
        description: 'Willkommen auf unserer Website',
        keywords: ['willkommen', 'startseite', 'hauptseite'],
        social: {
          twitter: '@willkommen',
          facebook: 'willkommen.page',
        },
      },
    },
    'fr-fr': {
      path: '/bienvenue',
      meta: {
        title: 'Bienvenue',
        description: 'Bienvenue sur notre site',
        keywords: ['bienvenue', 'accueil', 'principal'],
        social: {
          twitter: '@bienvenue',
          facebook: 'bienvenue.page',
        },
      },
    },
  },
})
</script>
