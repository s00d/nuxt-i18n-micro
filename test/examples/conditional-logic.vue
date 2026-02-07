<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with conditional logic
const isProduction = process.env.NODE_ENV === 'production'
const locales = isProduction ? ['en', 'de'] : ['en', 'de', 'fr', 'es']

// @ts-expect-error
$defineI18nRoute({
  locales: locales,
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen',
    ...(isProduction
      ? {}
      : {
          fr: '/bienvenue',
          es: '/bienvenido',
        }),
  },
})
</script>
