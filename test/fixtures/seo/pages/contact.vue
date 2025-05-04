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
  },
})
</script>
