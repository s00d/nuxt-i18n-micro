<script setup lang="ts">
definePageMeta({ keepalive: true, layout: 'switcher' })
const { $setI18nRouteParams } = useNuxtApp()
$setI18nRouteParams({ de: { slug: 'eins' }, en: { slug: 'one' }, ru: { slug: 'odin' } })
</script>

<template>
  <BenchPage name="keepalive-slug">
    <R id="keepalive-slug-de" :v="$switchLocalePath('de')" />
    <i18n-link data-testid="keepalive-first" to="/keepalive/first">first</i18n-link>
  </BenchPage>
</template>
