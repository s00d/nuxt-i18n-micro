<template>
  <div>
    <div>contact</div>

    <p>{{ $t('fallbackPage.value') }}</p>
    <p>{{ $t('fallback.value') }}</p>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  localeRoutes: {
    en: '/contact',
    de: '/kontakt',
  },
})
</script>

<style></style>
