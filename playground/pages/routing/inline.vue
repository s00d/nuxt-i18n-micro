<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: { inline_key: 'Inline en' },
    de: { inline_key: 'Inline de', path: '/inline-de' },
    fr: {},
  },
})
</script>

<template>
  <BenchPage name="routing-inline"><R id="inline-key" :v="$t('inline_key')" /></BenchPage>
</template>
