<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with WeakMap and WeakSet
const localeSet = new WeakSet()
const pathMap = new WeakMap()

const localeObj = {}
const pathObj = {}

localeSet.add(localeObj)
pathMap.set(pathObj, {
  en: '/welcome',
  de: '/willkommen',
  fr: '/bienvenue'
})

// Note: This is a contrived example since WeakMap/WeakSet don't work well for this
const locales = ['en', 'de', 'fr']
const localeRoutes = {
  en: '/welcome',
  de: '/willkommen',
  fr: '/bienvenue'
}

$defineI18nRoute({
  locales: locales,
  localeRoutes: localeRoutes
})
</script>
