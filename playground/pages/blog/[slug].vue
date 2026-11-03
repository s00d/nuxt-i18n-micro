<script setup lang="ts">
// Translated slugs: the params come with the data, the layout's <i18n-switcher> must still link to them.
const { $defineI18nRoute, $setI18nRouteParams } = useNuxtApp()

$defineI18nRoute({
  localeRoutes: { de: '/artikel/[slug]', fr: '/article/[slug]' },
})
definePageMeta({ layout: 'switcher' })

const route = useRoute()
const { data: post } = await useFetch<Record<string, string>>(`/api/bench/blog/${route.params.slug}`)
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'No such post', fatal: true })
$setI18nRouteParams(Object.fromEntries(Object.entries(post.value).map(([code, slug]) => [code, { slug }])))
</script>

<template>
  <BenchPage name="blog-slug">
    <R id="blog-slug" :v="route.params.slug" />
    <R id="blog-switch-de" :v="$switchLocalePath('de')" />
    <R id="blog-switch-ru" :v="$switchLocalePath('ru')" />
    <NuxtLink
      data-testid="blog-other"
      :to="$localePath({ name: 'blog-slug', params: { slug: post?.[$getLocale()] === 'second-post' ? 'hello-world' : 'second-post' } })"
      >other</NuxtLink
    >
  </BenchPage>
</template>
