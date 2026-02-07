<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with only locales property
$defineI18nRoute({
  locales: ['en', 'de', 'fr'],
})
</script>
