<template>
  <div>About Page</div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  localeRoutes: {
    en: '/about',
    de: '/a-propos',
  },
})
</script>
