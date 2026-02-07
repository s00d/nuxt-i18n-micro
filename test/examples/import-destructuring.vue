<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with import and destructuring
import { localeConfig } from './config/locale-config'

const { locales, localeRoutes } = localeConfig

// @ts-expect-error
$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes,
})
</script>
