<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with import from external file
import { getSupportedLocales, getLocalePaths } from './utils/locale-config'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: getSupportedLocales(),
  localeRoutes: getLocalePaths(),
})
</script>
