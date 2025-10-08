<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with getter and setter
const config = {
  _locales: ['en', 'de', 'fr'],
  _localeRoutes: {
    'en': '/welcome',
    'de': '/willkommen',
    'fr': '/bienvenue'
  },
  get locales() {
    return this._locales
  },
  set locales(value) {
    this._locales = value
  },
  get localeRoutes() {
    return this._localeRoutes
  },
  set localeRoutes(value) {
    this._localeRoutes = value
  }
}

$defineI18nRoute({
  locales: config.locales,
  localeRoutes: config.localeRoutes
})
</script>
