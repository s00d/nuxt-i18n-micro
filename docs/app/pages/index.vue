<script setup lang="ts">
import type { ButtonProps, PageFeatureProps } from '@nuxt/ui'
import { tv } from '~/utils/tv'

const landingTv = tv({
  slots: {
    headline: 'mb-4',
    hero: 'lg:py-28',
    section: 'py-16 sm:py-20 lg:py-24',
    features: 'sm:grid-cols-2 lg:grid-cols-4',
    snippet: 'min-w-0 [&>div:first-child]:mt-0',
    frameworks: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6',
    framework: 'flex items-center gap-3 rounded-lg border border-default px-4 py-3 transition-colors hover:bg-elevated/50 hover:border-accented',
    frameworkIcon: 'size-6 shrink-0 text-highlighted',
    frameworkName: 'text-sm font-medium text-highlighted',
  },
})

const ui = landingTv()
const { data: page } = await useAsyncData('landing', () => queryCollection('landing').path('/').first())

const landingTitle = page.value?.title || 'Nuxt I18n Micro'
const landingDescription = page.value?.description || 'Small, fast i18n for Nuxt with per-page JSON dictionaries and build-time localized routes.'

useSeoMeta({
  title: landingTitle,
  description: landingDescription,
  ogTitle: landingTitle,
  ogDescription: landingDescription,
  twitterTitle: landingTitle,
  twitterDescription: landingDescription,
  // Docs pages get a generated OG card (`defineOgImage`); the landing keeps the brand image.
  ogImage: 'https://s00d.github.io/nuxt-i18n-micro/og-image.png',
  twitterImage: 'https://s00d.github.io/nuxt-i18n-micro/og-image.png',
})

const heroLinks: ButtonProps[] = [
  { label: 'Get started', to: '/guide/getting-started', size: 'lg', trailingIcon: 'i-lucide-arrow-right' },
  {
    label: 'GitHub',
    to: 'https://github.com/s00d/nuxt-i18n-micro',
    target: '_blank',
    size: 'lg',
    color: 'neutral',
    variant: 'outline',
    icon: 'i-simple-icons-github',
  },
]

const features: PageFeatureProps[] = [
  {
    title: 'One dictionary per page',
    description: 'A page loads its own JSON plus the shared root keys, fetched on demand and never inlined into the HTML payload.',
    icon: 'i-lucide-file-json',
    to: '/guide/translations',
  },
  {
    title: 'Routes built at build time',
    description: 'Four prefix strategies, localized paths, redirects and 404s from one route model, with no runtime route matching.',
    icon: 'i-lucide-route',
    to: '/guide/strategy',
  },
  {
    title: 'SEO without extra code',
    description: 'Canonical URLs, hreflang alternates, html lang and dir, and og:locale on every localized page.',
    icon: 'i-lucide-search',
    to: '/guide/seo',
  },
  {
    title: 'Same core, more frameworks',
    description: 'Vue, React, Preact, Solid, Astro, Node and VitePress share the translation runtime and file layout.',
    icon: 'i-lucide-boxes',
    to: '/integrations',
  },
]

const quickStartLinks: ButtonProps[] = [
  { label: 'Getting started', to: '/guide/getting-started', trailingIcon: 'i-lucide-arrow-right' },
  { label: 'Migrate from @nuxtjs/i18n', to: '/guide/migration', color: 'neutral', variant: 'outline' },
]

const frameworks = [
  { label: 'Nuxt', to: '/guide/getting-started', icon: 'i-simple-icons-nuxtdotjs' },
  { label: 'Vue', to: '/integrations/vue-package', icon: 'i-simple-icons-vuedotjs' },
  { label: 'React', to: '/integrations/react-package', icon: 'i-simple-icons-react' },
  { label: 'Solid', to: '/integrations/solid-package', icon: 'i-simple-icons-solid' },
  { label: 'Astro', to: '/integrations/astro-package', icon: 'i-simple-icons-astro' },
  { label: 'VitePress', to: '/integrations/vitepress-package', icon: 'i-simple-icons-vitepress' },
]
</script>

<template>
  <div>
    <UPageHero
      title="Nuxt I18n Micro"
      description="Small, fast i18n for Nuxt. JSON translations loaded per page, localized routes generated at build time, SEO tags without extra code."
      orientation="horizontal"
      :links="heroLinks"
      :ui="{ container: ui.hero() }"
    >
      <template #headline>
        <UButton
          to="/news/v4.0.0"
          label="What's new in v4"
          trailing-icon="i-lucide-arrow-right"
          color="neutral"
          variant="subtle"
          size="sm"
          :class="ui.headline()"
        />
      </template>
      <LandingPerfPreview />
    </UPageHero>

    <UPageSection
      title="Why Nuxt I18n Micro"
      description="Only the translations a page needs, routes resolved before the first request, and SEO tags out of the box."
      :features="features"
      :ui="{ container: ui.section(), features: ui.features() }"
    />

    <UPageSection
      title="Up and running in two steps"
      description="Install the module, list your locales, and put a JSON file next to each page. Dev mode creates the empty files for you."
      orientation="horizontal"
      :links="quickStartLinks"
      :ui="{ container: ui.section() }"
    >
      <div :class="ui.snippet()">
        <ContentRenderer v-if="page" :value="page" />
      </div>
    </UPageSection>

    <UPageSection
      title="Not only Nuxt"
      description="The Nuxt module and the framework packages read the same JSON files through the same core."
      :ui="{ container: ui.section() }"
    >
      <div :class="ui.frameworks()">
        <NuxtLink v-for="fw in frameworks" :key="fw.to" :to="fw.to" :class="ui.framework()">
          <UIcon :name="fw.icon" :class="ui.frameworkIcon()" />
          <span :class="ui.frameworkName()">{{ fw.label }}</span>
        </NuxtLink>
      </div>
    </UPageSection>
  </div>
</template>
