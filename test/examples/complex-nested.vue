<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Complex object with nested structure
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: {
    'en-us': {
      path: '/welcome',
      meta: {
        title: 'Welcome',
      },
    },
    'de-de': {
      path: '/willkommen',
      meta: {
        title: 'Willkommen',
      },
    },
    'ru-ru': {
      path: '/dobro-pozhalovat',
      meta: {
        title: 'Добро пожаловать',
      },
    },
  },
})
</script>
