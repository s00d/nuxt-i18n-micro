<template>
  <div id="page-a">
    <h1 id="page-a-title">{{ $t('pageA.title') }}</h1>
    <p id="page-a-body">{{ $t('pageA.body') }}</p>
    <p id="page-a-shared">{{ $t('shared') }}</p>
    <p id="page-a-common">{{ $t('common.fromA') }}</p>
    <i18n-link id="go-to-b" :to="{ name: 'page-b' }">Go to B</i18n-link>
  </div>
</template>

<script setup>
import { definePageMeta, useNuxtApp } from '#imports'

// Per-page transition (was app.pageTransition in the old transition-merge fixture).
definePageMeta({ pageTransition: { name: 'page', mode: 'default' } })

const { $t, $defineI18nRoute } = useNuxtApp()

// `strategy-region-codes` sets other paths for this page in globalLocaleRoutes, and those must win
$defineI18nRoute({ localeRoutes: { 'en-us': '/from-page-a', 'de-de': '/von-seite-a' } })
</script>

<style>
/* 1.5 s simultaneous cross-fade, so the leaving and the entering page coexist in the DOM */
.page-enter-active,
.page-leave-active {
  transition: opacity 1.5s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
