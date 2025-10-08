<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with unusual locale codes
$defineI18nRoute({
  locales: ['en-us', 'de-de', 'fr-fr', 'es-es', 'pt-br', 'zh-cn', 'zh-tw', 'en-gb', 'fr-ca'],
  localeRoutes: {
    'en-us': '/welcome',
    'de-de': '/willkommen',
    'fr-fr': '/bienvenue',
    'es-es': '/bienvenido',
    'pt-br': '/bem-vindo',
    'zh-cn': '/huan-ying',
    'zh-tw': '/huan-ying',
    'en-gb': '/welcome',
    'fr-ca': '/bienvenue'
  }
})
</script>
