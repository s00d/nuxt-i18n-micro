<template>
  <div>
    <h1>Disable Meta Test</h1>
    <p>This page should not generate any i18n meta tags</p>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error
$defineI18nRoute({
  locales: ['en', 'fr'],
  disableMeta: true,
})
</script>
