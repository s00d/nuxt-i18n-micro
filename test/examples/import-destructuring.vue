<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with import and destructuring
import { localeConfig } from './config/locale-config'

const { locales, localeRoutes } = localeConfig

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes,
})
</script>
