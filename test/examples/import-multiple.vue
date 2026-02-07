<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with multiple imports

import { isProduction } from './config/env'
import { getLocales } from './utils/locale-utils'
import { getPaths } from './utils/path-utils'

// @ts-expect-error
$defineI18nRoute({
  locales: getLocales(),
  localeRoutes: getPaths(),
  // Additional property to test
  production: isProduction,
})
</script>
