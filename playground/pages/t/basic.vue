<script setup lang="ts">
const { $_t, $_ts } = useNuxtApp()
const route = useRoute()
const bound = $_t(route)
const boundString = $_ts(route)
</script>

<template>
  <BenchPage name="t-basic">
    <R id="t" :v="$t('title')" />
    <R id="t-params" :v="$t('welcome', { name: 'Ada' })" />
    <R id="t-nested" :v="$t('nested.deep.key')" />
    <R id="t-object" :v="$t('nested.deep')" />
    <R id="t-array" :v="$t('list')" />
    <R id="t-default" :v="$t('missing.key', {}, 'Fallback')" />
    <R id="t-missing" :v="$t('missing.key')" />
    <R id="t-empty" :v="$t('empty')" />
    <R id="t-page" :v="$t('page_title')" />
    <R id="t-only-en" :v="$t('only_en')" />
    <R id="t-only-de" :v="$t('only_de')" />
    <R id="ts" :v="$ts('title')" />
    <R id="ts-object" :v="$ts('nested.deep')" />
    <R id="_t" :v="bound('page_title')" />
    <R id="_ts" :v="boundString('page_title')" />
    <R id="has-yes" :v="$has('title')" />
    <R id="has-no" :v="$has('missing.key')" />
    <R id="extra-dir" :v="$t('extra.marker')" />
    <R id="extra-override" :v="$t('extra.override')" />
    <R id="alt-dir" :v="$t('alt.marker')" />
    <R id="layer-marker" :v="$t('layer.marker')" />
    <R id="layer-override" :v="$t('layer.override')" />
  </BenchPage>
</template>
