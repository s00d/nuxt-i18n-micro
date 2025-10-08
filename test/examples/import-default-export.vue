<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with import of default export
import localeConfig from './config/default-locale-config'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: localeConfig.locales,
  localeRoutes: localeConfig.paths,
})
</script>
