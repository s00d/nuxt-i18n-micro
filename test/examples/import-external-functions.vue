<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with import from external file
import { getLocalePaths, getSupportedLocales } from './utils/locale-config'

// @ts-expect-error
$defineI18nRoute({
  locales: getSupportedLocales(),
  localeRoutes: getLocalePaths(),
})
</script>
