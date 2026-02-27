<template>
  <div>
    <h1>Disable Meta All</h1>
    <p>This page has meta tags completely disabled for all locales</p>
    <p>Check the page source - no i18n meta tags should be present</p>
  </div>
</template>

<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: ['en', 'fr', 'de', 'es'],
  disableMeta: true,
})
</script>
