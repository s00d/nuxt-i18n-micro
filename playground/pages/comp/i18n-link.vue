<script setup lang="ts">
const { $localeRoute } = useNuxtApp()
</script>

<template>
  <BenchPage name="comp-i18n-link">
    <R id="il-string"><i18n-link to="/static-page">string</i18n-link></R>
    <R id="il-named"><i18n-link :to="{ name: 'static-page' }">named</i18n-link></R>
    <R id="il-custom-path"><i18n-link to="/about">custom path</i18n-link></R>
    <R id="il-params"><i18n-link :to="{ name: 'products-id', params: { id: 7 } }">params</i18n-link></R>
    <R id="il-query"><i18n-link :to="{ path: '/static-page', query: { a: '1' }, hash: '#h' }">query</i18n-link></R>
    <R id="il-other-locale"><i18n-link :to="$localeRoute('/static-page', 'de')">other locale</i18n-link></R>
    <R id="il-active"><i18n-link to="/comp/i18n-link" :active-style="{ color: 'red' }">active</i18n-link></R>
    <R id="il-external"><i18n-link to="https://example.com/">external</i18n-link></R>
    <R id="il-mailto"><i18n-link to="mailto:bench@example.com">mailto</i18n-link></R>
    <R id="il-tel"><i18n-link to="tel:+15550100">tel</i18n-link></R>
    <R id="il-unlocalized"><i18n-link to="/unlocalized">unlocalized</i18n-link></R>
    <R id="il-resolved" :v="$localeRoute('/static-page').fullPath" />
  </BenchPage>
</template>
