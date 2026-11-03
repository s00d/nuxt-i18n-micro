<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { tv } from '~/utils/tv'

const headerTv = tv({
  slots: {
    brand: 'flex items-center gap-2 rounded-md p-1 -ms-1 focus-visible:outline-3 outline-primary/25',
    logo: 'size-6 shrink-0',
    title: 'font-semibold hidden sm:inline',
    nav: 'hidden lg:flex items-center justify-center gap-0.5',
    mobileSections: 'mb-4 flex flex-wrap gap-1 lg:hidden',
    searchDesktop: 'hidden lg:flex',
    searchMobile: 'lg:hidden',
    iconBtn: 'hidden sm:inline-flex',
  },
})

const ui = headerTv()
// Computed here: vue-tsc reports `ui.mobileSections()` inside UHeader's `#body` slot as TS2339 (`value`).
const mobileSectionsClass = ui.mobileSections()
const sectionNav = useSectionNavigation()
const sections = useDocsSectionList()
const active = useActiveDocsSection()
const { header } = useAppConfig() as { header: { search?: boolean; colorMode?: boolean } }

// Everything in the header follows the docs version of the page: sections, home link, search.
const version = useDocsVersion()
const isV3 = computed(() => version.value === 'v3')
const versionLinks = useVersionLinks()
const versionItems = computed<DropdownMenuItem[]>(() => [
  { label: 'v4', description: 'Current version', to: versionLinks.value.v4, icon: isV3.value ? 'i-lucide-circle' : 'i-lucide-circle-check' },
  { label: 'v3', description: 'Archived docs', to: versionLinks.value.v3, icon: isV3.value ? 'i-lucide-circle-check' : 'i-lucide-circle' },
])
</script>

<template>
  <UHeader :ui="{ center: 'flex-1' }">
    <template #left>
      <NuxtLink :to="VERSION_HOME[version]" :class="ui.brand()" aria-label="Nuxt I18n Micro home">
        <!-- Sized in markup too, so the logo never renders at the SVG's intrinsic size before CSS. -->
        <img src="/logo.svg" alt="" width="24" height="24" :class="ui.logo()" />
        <span :class="ui.title()">Nuxt I18n Micro</span>
      </NuxtLink>
      <UDropdownMenu :items="versionItems" :content="{ align: 'start' }">
        <UButton
          :label="isV3 ? 'v3' : 'v4'"
          :color="isV3 ? 'warning' : 'neutral'"
          variant="subtle"
          size="xs"
          trailing-icon="i-lucide-chevron-down"
          aria-label="Documentation version"
        />
      </UDropdownMenu>
    </template>

    <template #default>
      <nav :class="ui.nav()" aria-label="Sections">
        <UButton
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          color="neutral"
          :variant="active?.to === section.to ? 'soft' : 'ghost'"
          size="sm"
          :ui="{ base: active?.to === section.to ? 'text-primary' : undefined }"
        >
          {{ section.label }}
        </UButton>
      </nav>
    </template>

    <template #right>
      <UContentSearchButton v-if="header?.search" :class="ui.searchMobile()" />
      <UContentSearchButton v-if="header?.search" :collapsed="false" :class="ui.searchDesktop()" />
      <UColorModeButton v-if="header?.colorMode" />
      <UButton
        :class="ui.iconBtn()"
        icon="i-simple-icons-npm"
        color="neutral"
        variant="ghost"
        square
        to="https://www.npmjs.com/package/nuxt-i18n-micro"
        target="_blank"
        aria-label="nuxt-i18n-micro on npm"
      />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        square
        to="https://github.com/s00d/nuxt-i18n-micro"
        target="_blank"
        aria-label="nuxt-i18n-micro on GitHub"
      />
    </template>

    <template #body>
      <div :class="mobileSectionsClass">
        <UButton
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          color="neutral"
          :variant="active?.to === section.to ? 'soft' : 'ghost'"
          size="sm"
        >
          {{ section.label }}
        </UButton>
      </div>
      <UContentNavigation highlight default-open :navigation="sectionNav" />
    </template>
  </UHeader>
</template>
