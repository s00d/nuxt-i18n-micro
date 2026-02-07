<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with import of constants
import { LOCALE_PATHS, SUPPORTED_LOCALES } from './config/i18n'

// @ts-expect-error
$defineI18nRoute({
  locales: SUPPORTED_LOCALES,
  localeRoutes: LOCALE_PATHS,
})
</script>
