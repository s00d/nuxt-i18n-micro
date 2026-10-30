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
  excerpt: string
  imageUrl: string
  canonicalUrl: string
  locales: Record<string, string>
}

function normalizeSeoUrl(href: string): string {
  try {
    const url = new URL(href, 'https://placeholder.local')
    url.search = ''
    url.hash = ''
    return href.startsWith('http') ? url.href : url.pathname
  } catch {
    return href.split(/[?#]/)[0] ?? href
  }
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
  const alternates = localeCodes.map((locale) => ({
    rel: 'alternate' as const,
    hreflang: locale,
    href: normalizeSeoUrl(article.value!.locales[locale]!),
  }))

  useI18nHead({
    meta: [
      { property: 'og:title', content: article.value.title },
      { property: 'og:description', content: article.value.excerpt },
      { property: 'og:image', content: article.value.imageUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: article.value.title },
    ],
    replace: {
      canonical: article.value.canonicalUrl,
      ogUrl: article.value.canonicalUrl,
      hreflang: alternates,
      ogAlternates: localeCodes,
    },
  })
}
</script>
