<template>
  <div>contact</div>
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
