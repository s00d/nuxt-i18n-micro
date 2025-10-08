<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with multiple imports
import { getLocales } from './utils/locale-utils'
import { getPaths } from './utils/path-utils'
import { isProduction } from './config/env'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
$defineI18nRoute({
  locales: getLocales(),
  localeRoutes: getPaths(),
  // Additional property to test
  production: isProduction,
})
</script>
