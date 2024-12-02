<template>
  <div id="locale-switcher">
    <i18n-switcher />
  </div>
  <NuxtLink
    id="home"
    :to="$localeRoute({ name: 'index' })"
  >
    Home
  </NuxtLink>
  <article>
    <ContentRenderer :value="doc" />
  </article>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from '#imports'

const route = useRoute()
const { $getLocale, $localeRoute } = useI18n()

// Удаляем локаль из пути, если она есть
const pathWithoutLocale = route.path.replace(`/${$getLocale()}`, '')

// Загружаем контент, удаляя начальный "/" для корректного пути в queryContent
const docPath = pathWithoutLocale.startsWith('/')
  ? pathWithoutLocale.slice(1)
  : pathWithoutLocale

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const doc = await queryContent(`/${docPath}`).findOne()
</script>
