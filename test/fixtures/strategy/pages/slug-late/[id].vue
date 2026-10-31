<template>
  <p id="slug-late-page">slug-late-{{ id }}</p>
</template>

<script setup>
import { useAsyncData, useNuxtApp, useRoute } from '#imports'

// params set inside the handler, which can outlive the page: no useI18nHead, and async setup keeps the left page mounted
const id = String(useRoute().params.id).split('-')[0]
const { $setI18nRouteParams } = useNuxtApp()
await useAsyncData(`slug-late-${id}`, async () => {
  const slugs = await $fetch(`/api/slug/${id}`)
  $setI18nRouteParams(slugs)
  return slugs
})
</script>
