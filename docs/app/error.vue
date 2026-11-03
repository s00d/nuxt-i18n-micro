<script setup lang="ts">
import type { NuxtError } from '#app'
import type { ButtonProps } from '@nuxt/ui'

const props = defineProps<{ error: NuxtError }>()

// The error page replaces app.vue: it loads the same navigation for the header, menu and search.
const { searchNavigation, searchFiles } = await useDocsNavigation()

const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => (notFound.value ? 'Page not found' : 'Error'),
  robots: 'noindex',
})

const { open: searchOpen } = useContentSearch()
const title = computed(() => (notFound.value ? 'Page not found' : 'Something went wrong'))
const description = computed(() =>
  notFound.value
    ? 'This page does not exist or has moved. Search the docs to find where it went.'
    : props.error.message || 'An unexpected error occurred.',
)
const links: ButtonProps[] = [
  { label: 'Getting started', to: '/guide/getting-started', trailingIcon: 'i-lucide-arrow-right' },
  {
    label: 'Search the docs',
    icon: 'i-lucide-search',
    color: 'neutral',
    variant: 'outline',
    onClick: () => {
      searchOpen.value = true
    },
  },
  { label: 'Home', to: '/', color: 'neutral', variant: 'ghost' },
]
</script>

<template>
  <UApp>
    <AppHeader />
    <UMain>
      <UContainer>
        <UPageHero :headline="String(error.statusCode || 500)" :title="title" :description="description" :links="links" />
      </UContainer>
    </UMain>
    <ClientOnly>
      <LazyUContentSearch :files="searchFiles" :navigation="searchNavigation" />
    </ClientOnly>
  </UApp>
</template>
