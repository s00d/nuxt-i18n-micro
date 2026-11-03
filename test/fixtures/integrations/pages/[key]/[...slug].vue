<template>
  <div id="locale-switcher">
    <i18n-switcher />
  </div>
  <NuxtLink id="home" :to="$localeRoute({ name: 'index' })"> Home </NuxtLink>
  <article class="data-item">
    <ContentRenderer v-if="doc" :value="doc" />
    <div v-else>Loading...</div>
  </article>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { createError, useAsyncData, useI18n } from '#imports'

const route = useRoute()
const { $getLocale, $localeRoute } = useI18n()

const path = route.path.replace(`/${$getLocale()}`, '')

// awaited in setup: an async watcher would set it after the first client render, and hydration would see "Loading..."
// @ts-expect-error
const { data: doc } = await useAsyncData(`content-${path}`, () => queryCollection('content').path(path).first())

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}
</script>
