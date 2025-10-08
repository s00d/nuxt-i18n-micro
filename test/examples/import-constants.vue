<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with import of constants
import { SUPPORTED_LOCALES, LOCALE_PATHS } from './config/i18n'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: SUPPORTED_LOCALES,
  localeRoutes: LOCALE_PATHS,
})
</script>
