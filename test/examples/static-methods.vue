<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Test with static methods
class LocaleManager {
  static getSupportedLocales() {
    return ['en', 'de', 'fr']
  }

  static getLocalePaths() {
    return {
      en: '/welcome',
      de: '/willkommen',
      fr: '/bienvenue',
    }
  }
}

$defineI18nRoute({
  locales: LocaleManager.getSupportedLocales(),
  localeRoutes: LocaleManager.getLocalePaths(),
})
</script>
