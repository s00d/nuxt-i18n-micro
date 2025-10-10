<template>
  <div>
    <h1>Disable Meta Locale</h1>
    <p>This page has meta tags disabled only for English locale</p>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  disableMeta: ['en'],
})
</script>
