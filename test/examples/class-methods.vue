<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
// Test with class and methods
class LocaleConfig {
  private locales: string[] = ['en', 'de', 'fr']

  getLocales() {
    return this.locales
  }

  getPaths() {
    return {
      en: '/welcome',
      de: '/willkommen',
      fr: '/bienvenue',
    }
  }
}

const config = new LocaleConfig()

// @ts-expect-error
$defineI18nRoute({
  locales: config.getLocales(),
  localeRoutes: config.getPaths(),
})
</script>
