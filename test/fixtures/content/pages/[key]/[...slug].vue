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
  <article class="data-item">
    <ContentRenderer
      v-if="doc"
      :value="doc"
    />
    <div v-else>
      Loading...
    </div>
  </article>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { createError, ref, useAsyncData, useI18n, watch } from '#imports'

const route = useRoute()
const { $getLocale, $localeRoute } = useI18n()

// Реактивная переменная для контента
const doc = ref(null)

// Функция для загрузки контента
const loadContent = async (path) => {
  try {
    // Удаляем локаль из пути, если она есть
    const pathWithoutLocale = path.replace(`/${$getLocale()}`, '')

    // Загружаем контент, удаляя начальный "/" для корректного пути в queryContent
    const docPath = pathWithoutLocale.startsWith('/') ? pathWithoutLocale.slice(1) : pathWithoutLocale

    // @ts-expect-error
    const { data } = await useAsyncData(`content-${docPath}`, () => queryCollection('content').path(`/${docPath}`).first())

    doc.value = data.value
  } catch (error) {
    console.error('Failed to load content:', error)
    doc.value = null
  }
}

// Следим за изменениями маршрута и обновляем контент
watch(
  () => route.path,
  async (newPath) => {
    if (newPath) {
      await loadContent(newPath)
    }
  },
  { immediate: true },
)

// Проверяем наличие контента
watch(doc, (newDoc) => {
  if (newDoc === null) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
    })
  }
})
</script>
