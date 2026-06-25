<template>
  <div v-if="post">
    <h1>{{ post.title }}</h1>
    <p data-testid="post-title">{{ post.title }}</p>
  </div>
</template>

<script setup lang="ts">
import { createError, useFetch, useI18nHead, useNuxtApp, useRoute } from '#imports'

interface Post {
  title: string
  locales: Record<string, string>
  urlEn: string
  urlFr: string
}

// @ts-expect-error - name property exists but not in types
definePageMeta({ name: 'post-slug' })

const route = useRoute()
const { $defineI18nRoute, $setI18nRouteParams } = useNuxtApp()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

const { data: post, error } = await useFetch<Post>(`/api/post/${slug}`)
if (error.value) {
  throw createError({
    statusCode: error.value?.statusCode,
    statusMessage: error.value?.statusMessage,
    fatal: true,
  })
}

$defineI18nRoute({
  localeRoutes: {
    en: '/post/[slug]',
    fr: '/fr/article/[slug]',
  },
})

if (post.value) {
  $setI18nRouteParams({
    en: { slug: post.value.urlEn },
    fr: { slug: post.value.urlFr },
  })

  const postLocales = Object.keys(post.value.locales)

  useI18nHead({
    meta: [{ property: 'og:title', content: post.value.title }],
    replace: {
      hreflang: postLocales.map((locale) => ({
        rel: 'alternate',
        hreflang: locale,
        href: post.value!.locales[locale]!,
      })),
      ogAlternates: postLocales,
    },
  })
}
</script>
