<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with import aliases
import { getSupportedLocales as getLocales, getLocalePaths as getPaths } from './utils/locale-helpers'

// @ts-expect-error
$defineI18nRoute({
  locales: getLocales(),
  localeRoutes: getPaths(),
})
</script>
