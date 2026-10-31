<template>
  <div>
    <p id="slug-page">slug-{{ id }}</p>
    <i18n-link id="slug-first" to="/slug/1">first</i18n-link>
  </div>
</template>

<script setup>
import { definePageMeta, useAsyncData, useI18nHead, useNuxtApp, useRoute } from '#imports'

// the documented shape: params once the data is loaded, with the switcher in the layout, which renders first
definePageMeta({ layoutSwitcher: true, keepalive: true })

const id = String(useRoute().params.id).split('-')[0]
const { $setI18nRouteParams } = useNuxtApp()
const { data } = await useAsyncData(`slug-${id}`, () => $fetch(`/api/slug/${id}`))
$setI18nRouteParams(data.value)
useI18nHead({ meta: [{ property: 'og:title', content: `SLUG-${id}` }] })
</script>
