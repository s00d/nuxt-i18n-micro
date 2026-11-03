import type { ContentNavigationItem } from '@nuxt/content'

/**
 * Sort sidebar from `navigation.order` in page frontmatter / `.navigation.yml`.
 * Content itself only orders by `stem`, so we re-sort the tree by this field.
 */
function orderOf(item: ContentNavigationItem): number {
  const raw = (item as ContentNavigationItem & { order?: number | string }).order
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER
}

function sortItems(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return (
    [...items]
      .sort((a, b) => {
        const d = orderOf(a) - orderOf(b)
        if (d) return d
        const pa = a.path || ''
        const pb = b.path || ''
        return pa.localeCompare(pb)
      })
      // a copy, not in place: useDocsSections sorts items of the shared navigation tree again
      .map((item) => (item.children?.length ? Object.assign({}, item, { children: sortItems(item.children) }) : item))
  )
}

export function sortDocsNavigation(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return sortItems(items)
}
