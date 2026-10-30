<template>
  <div v-if="article">
    <h1>{{ article.title }}</h1>
    <p data-testid="article-title">{{ article.title }}</p>
  </div>
</template>

<script setup lang="ts">
import { buildArticleHead, type LocalizedContent } from '../../composables/buildArticleHead'
import { createError, useFetch, useI18nHead, useRoute } from '#imports'

const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
const { data: article, error } = await useFetch<LocalizedContent>(`/api/articles/${slug}`)

if (error.value) {
  throw createError({
    statusCode: error.value?.statusCode,
    statusMessage: error.value?.statusMessage,
    fatal: true,
  })
}

if (article.value) {
  useI18nHead(buildArticleHead(article.value))
}
</script>
