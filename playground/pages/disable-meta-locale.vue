<template>
  <div>
    <h1>Disable Meta Locale</h1>
    <p>This page has meta tags disabled only for English locale</p>
    <p>Check the page source:</p>
    <ul>
      <li>/disable-meta-locale - no i18n meta tags</li>
      <li>/fr/disable-meta-locale - i18n meta tags present</li>
      <li>/de/disable-meta-locale - i18n meta tags present</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: ['de'],
  disableMeta: ['en'],
})
</script>
