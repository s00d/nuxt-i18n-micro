<template>
  <div v-if="article">
    <h1>{{ article.title }}</h1>
    <p data-testid="article-title">{{ article.title }}</p>
  </div>
</template>

<script setup lang="ts">
import { createError, useFetch, useI18nHead, useRoute } from '#imports'

interface Article {
  title: string
  locales: Record<string, string>
  defaultHref: string
}

const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
const { data: article, error } = await useFetch<Article>(`/api/articles/${slug}`)

if (error.value) {
  throw createError({
    statusCode: error.value?.statusCode,
    statusMessage: error.value?.statusMessage,
    fatal: true,
  })
}

if (article.value) {
  const localeCodes = Object.keys(article.value.locales)

  useI18nHead({
    replace: {
      hreflang: localeCodes.map((locale) => ({
        rel: 'alternate',
        hreflang: locale,
        href: article.value!.locales[locale]!,
      })),
      xDefault: {
        rel: 'alternate',
        hreflang: 'x-default',
        href: article.value.defaultHref,
      },
      ogAlternates: localeCodes,
    },
  })
}
</script>
