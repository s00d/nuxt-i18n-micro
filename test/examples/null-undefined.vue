<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with null and undefined values
$defineI18nRoute({
  locales: null,
  localeRoutes: undefined
})
</script>
