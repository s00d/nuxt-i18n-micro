<template>
  <div>
    <p id="content">
      {{ $t('contact') }}
    </p>

    <div id="locale-switcher">
      <i18n-switcher />
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t, $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  localeRoutes: {
    en: '/contact',
    de: '/kontakt',
    ru: '/contact',
    // REGION_CODES=1 (keys of codes a build does not have are ignored)
    'en-us': '/contact',
    'de-de': '/kontakt',
    'ru-ru': '/contact',
  },
})
</script>
