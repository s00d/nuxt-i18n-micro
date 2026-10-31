<template>
  <p id="page-head">{{ $t('shared') }}</p>
</template>

<script setup>
import { useI18nHead, useNuxtApp, useRoute } from '#imports'

const { $t } = useNuxtApp()
const head = () => ({
  meta: [{ property: 'og:title', content: `HEAD:${$t('shared')}` }],
  replace: { hreflang: [{ rel: 'alternate', hreflang: 'en', href: 'https://x.test/page-head' }] },
})
useI18nHead(useRoute().params.form === 'getter' ? head : head())
</script>
