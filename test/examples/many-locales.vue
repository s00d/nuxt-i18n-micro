<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with many locales
$defineI18nRoute({
  locales: ['en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'th', 'vi', 'tr', 'pl', 'nl', 'sv', 'no', 'da'],
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
    es: '/bienvenido',
    it: '/benvenuto',
    pt: '/bem-vindo',
    ru: '/dobro-pozhalovat',
    ja: '/yokoso',
    ko: '/hwan-yeong',
    zh: '/huan-ying',
    ar: '/ahlan-wa-sahlan',
    hi: '/swagat',
    th: '/yindee-ton-rab',
    vi: '/chao-mung',
    tr: '/hos-geldiniz',
    pl: '/witamy',
    nl: '/welkom',
    sv: '/valkommen',
    no: '/velkommen',
    da: '/velkommen',
  },
})
</script>
