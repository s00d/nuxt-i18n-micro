<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import type { ButtonProps, ContentSurroundLink } from '@nuxt/ui'
import { findPageHeadline } from '@nuxt/content/utils'
import { withoutTrailingSlash } from 'ufo'
import { tv } from '~/utils/tv'

const pageTv = tv({
  slots: {
    v3Banner: 'mt-8',
    footer: 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-default pt-6 text-sm text-muted',
    editLink: 'inline-flex items-center gap-1.5 rounded-sm hover:text-highlighted focus-visible:text-highlighted transition-colors',
    tocBottom: 'hidden lg:block space-y-6',
  },
})

const ui = pageTv()

definePageMeta({
  layout: 'docs',
})

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const routePath = computed(() => withoutTrailingSlash(route.path))
const isV3 = isV3Path(routePath.value)
const collection = VERSION_COLLECTION[isV3 ? 'v3' : 'v4']

const { data: page } = await useAsyncData(routePath.value, () => queryCollection(collection).path(routePath.value).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

/**
 * Prev/next follow the sidebar (`navigation.order` and groups), not the content stem order that
 * `queryCollectionItemSurroundings` uses, and stay inside the active section.
 */
const sectionNav = useSectionNavigation()
const { data: surround } = await useAsyncData(`${routePath.value}-surround`, async () => {
  const pages = flattenNavigation(sectionNav.value)
  const index = pages.findIndex((item) => item.path === routePath.value)
  const [prev, next] = index === -1 ? [] : [pages[index - 1], pages[index + 1]]
  const wanted = [prev?.path, next?.path].filter((path): path is string => Boolean(path))
  const found = wanted.length ? await queryCollection(collection).where('path', 'IN', wanted).select('title', 'path', 'description').all() : []
  // UContentSurround reads `[prev, next]` and skips a `null` side (`v-if="link"`), the same shape
  // `queryCollectionItemSurroundings` returns.
  return [prev, next].map((item) => found.find((entry) => entry.path === item?.path) ?? null) as ContentSurroundLink[]
})

const versionLinks = useVersionLinks()
const v3Actions = computed<ButtonProps[]>(() => [
  { label: 'Open the v4 docs', to: versionLinks.value.v4, color: 'warning', variant: 'solid', trailingIcon: 'i-lucide-arrow-right' },
])

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title: isV3 && !/\bv3\b/.test(title) ? `${title} (v3)` : title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
  // The archive stays reachable but should not compete with the current docs in search engines.
  robots: isV3 ? 'noindex, follow' : undefined,
})

const headline = computed(() => (isV3 ? 'v3 archive' : findPageHeadline(navigation?.value, page.value?.path)))

defineOgImage('DocsPage', { title, description, headline: headline.value })

const editUrl = computed(() => (toc?.bottom?.edit ? `${toc.bottom.edit}/${page.value?.stem}.${page.value?.extension}` : undefined))
const lastUpdated = computed(() => {
  const iso = page.value?.lastUpdated
  if (!iso) return undefined
  return {
    iso,
    label: new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
  }
})
const tocLinks = computed(() => page.value?.body?.toc?.links ?? [])
</script>

<template>
  <UPage v-if="page">
    <UAlert
      v-if="isV3"
      :class="ui.v3Banner()"
      color="warning"
      variant="subtle"
      icon="i-lucide-history"
      title="You are reading the v3 documentation"
      description="v3 is no longer developed. The current version is v4."
      :actions="v3Actions"
    />

    <UPageHeader :title="page.title" :description="page.description" :headline="headline">
      <template v-if="page.links?.length" #links>
        <UButton v-for="(link, index) in page.links" :key="index" v-bind="link" />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer :value="page" />

      <footer v-if="editUrl || lastUpdated" :class="ui.footer()">
        <ULink v-if="editUrl" :to="editUrl" target="_blank" :class="ui.editLink()">
          <UIcon name="i-lucide-square-pen" aria-hidden="true" />
          Edit this page on GitHub
        </ULink>
        <span v-if="lastUpdated">
          Last updated <time :datetime="lastUpdated.iso">{{ lastUpdated.label }}</time>
        </span>
      </footer>

      <UContentSurround v-if="surround?.some(Boolean)" :surround="surround" />
    </UPageBody>

    <template v-if="tocLinks.length" #right>
      <UContentToc :title="toc?.title" :links="tocLinks" highlight>
        <template v-if="toc?.bottom" #bottom>
          <div :class="ui.tocBottom()">
            <USeparator type="dashed" />
            <UPageLinks :title="toc.bottom.title" :links="toc.bottom.links" />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
