<template>
  <div>
    <h1>Disable Meta All</h1>
    <p>This page has meta tags completely disabled for all locales</p>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error
$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  disableMeta: true,
})
</script>
