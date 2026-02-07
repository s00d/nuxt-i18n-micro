<template>
  <div>
    <h1>Disable Meta for Specific Locales</h1>
    <p>Meta tags should be disabled only for 'en' and 'fr' locales</p>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error
$defineI18nRoute({
  locales: ['en', 'fr', 'de', 'ru'],
  disableMeta: ['en', 'fr'], // Disable meta only for English and French
})
</script>
