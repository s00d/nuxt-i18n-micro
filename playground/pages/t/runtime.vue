<script setup lang="ts">
const { $mergeTranslations, $setTranslation, $loadPageTranslations, $resolveTranslations, $clearCache, $getLocale, $t } = useNuxtApp()
const size = ref(0)
const count = () => (size.value = Object.keys($resolveTranslations()).length)
const load = (locale: string) => $loadPageTranslations(locale, 't-runtime', { runtime: { loaded: `loaded ${locale}` } })
</script>

<template>
  <BenchPage name="t-runtime">
    <button data-testid="do-merge" @click="$mergeTranslations({ runtime: { merged: `merged ${$getLocale()}` } })">merge</button>
    <button data-testid="do-set" @click="$setTranslation('runtime.set', 'set value')">set</button>
    <button data-testid="do-set-branch" @click="$setTranslation('runtime', { only: 'branch replaced' })">set branch</button>
    <button data-testid="do-load" @click="load($getLocale())">load active</button>
    <button data-testid="do-load-de" @click="load('de')">load de</button>
    <button data-testid="do-clear" @click="$clearCache()">clearCache</button>
    <button data-testid="do-count" @click="count">count</button>
    <R id="runtime-file" :v="$t('page_title')" />
    <R id="runtime-merged" :v="$t('runtime.merged')" />
    <R id="runtime-set" :v="$t('runtime.set')" />
    <R id="runtime-only" :v="$t('runtime.only')" />
    <R id="runtime-loaded" :v="$t('runtime.loaded')" />
    <R id="runtime-size" :v="size" />
  </BenchPage>
</template>
