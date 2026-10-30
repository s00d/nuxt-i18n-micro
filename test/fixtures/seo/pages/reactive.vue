<template>
  <div>
    <h1>Reactive article</h1>
    <p v-if="article" data-testid="article-title">{{ article.title }}</p>
    <p v-else data-testid="loading">loading</p>
  </div>
</template>

<script setup lang="ts">
import { ofetch } from 'ofetch'
import { onMounted, ref, useI18nHead } from '#imports'
interface Article {
  title: string
  locales: Record<string, string>
}

const article = ref<Article | null>(null)

onMounted(async () => {
  article.value = await ofetch<Article>('/api/articles/reactive-client')
})

useI18nHead(() => {
  if (!article.value) return null

  const localeCodes = Object.keys(article.value.locales)

  return {
    meta: [{ property: 'og:title', content: article.value.title }],
    replace: {
      hreflang: localeCodes.map((locale) => ({
        rel: 'alternate',
        hreflang: locale,
        href: article.value!.locales[locale]!,
      })),
      ogAlternates: localeCodes,
    },
  }
})
</script>
