<script setup lang="ts">
const { $t } = useNuxtApp()
useI18nHead(() => ({
  htmlAttrs: { 'data-bench': 'head' },
  meta: [{ name: 'bench-head', content: $t('title') as string }],
  link: [{ rel: 'bench', href: '/bench' }],
  replace: { canonical: 'https://bench.example/replaced', xDefault: false },
}))
</script>

<template>
  <BenchPage name="head-use-i18n-head"><i18n-link data-testid="leave" to="/static-page">leave</i18n-link></BenchPage>
</template>
