import { sortDocsNavigation } from '~/utils/docsNavOrder'

/**
 * Loads the v4 and v3 navigation trees and provides them to the header, sidebar and pages.
 * Called by `app.vue` and `error.vue` (an error page replaces the app root, so it needs its own).
 * `navigation.group` in page frontmatter is spread onto the items and read by `useSectionNavigation`.
 */
export async function useDocsNavigation() {
  const docs = useAsyncData('navigation', async () => sortDocsNavigation(await queryCollectionNavigation('docs')), { default: () => [] })
  // The archived v3 docs: their own collection, so they stay out of search and the v4 sidebar.
  const v3 = useAsyncData('v3-navigation', async () => sortDocsNavigation(await queryCollectionNavigation('v3')), { default: () => [] })
  // Search covers the docs version of the page; loaded after hydration, it is in no page payload.
  const version = useDocsVersion()
  const search = useLazyAsyncData(
    () => `search-${version.value}`,
    () => queryCollectionSearchSections(VERSION_COLLECTION[version.value]),
    {
      server: false,
    },
  )

  // The search groups results by these top-level items, so they follow the version too. Built from
  // the local refs: `inject` in the component that provides would not see its own values.
  const searchNavigation = computed(() => versionTree(version.value, docs.data.value, v3.data.value))

  // Before the `await`: `provide` and `computed` need the component instance, which an awaited call drops.
  provide('navigation', docs.data)
  provide('v3Navigation', v3.data)
  await Promise.all([docs, v3])

  return { searchNavigation, searchFiles: search.data }
}
