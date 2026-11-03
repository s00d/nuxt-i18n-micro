<script setup lang="ts">
const { seo } = useAppConfig()
const siteName = seo?.siteName ?? 'Nuxt I18n Micro'
/** Always the published origin (not local `app.baseURL`, which is `/` in `nuxt dev`). */
const siteOrigin = 'https://s00d.github.io/nuxt-i18n-micro'

const { searchNavigation, searchFiles } = await useDocsNavigation()

const route = useRoute()
const canonical = computed(() => {
  const path = route.path === '/' ? '' : route.path.replace(/\/$/, '')
  return `${siteOrigin}${path}`
})

useHead({
  htmlAttrs: { lang: 'en' },
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'canonical', href: canonical }],
  titleTemplate: (title?: string) => {
    if (!title || title === siteName) return siteName
    return `${title} · ${siteName}`
  },
})

useSeoMeta({
  ogSiteName: siteName,
  ogUrl: canonical,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <AppHeader />
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <ClientOnly>
      <LazyUContentSearch :files="searchFiles" :navigation="searchNavigation" />
    </ClientOnly>
  </UApp>
</template>
