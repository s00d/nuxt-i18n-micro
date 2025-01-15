<template>
  <span id="comp1">
    {{ $t('text') }}
  </span>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: {
      text: 'en text',
    },
    de: {
      text: 'de text',
    },
    ru: {},
    fr: {},
    ch: {},
  },
})
</script>
