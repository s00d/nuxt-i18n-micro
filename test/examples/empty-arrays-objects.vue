<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with empty arrays and objects
$defineI18nRoute({
  locales: [],
  localeRoutes: {},
})
</script>
