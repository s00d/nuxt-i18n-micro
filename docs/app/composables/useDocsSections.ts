import type { ContentNavigationItem } from '@nuxt/content'
import { redirectTarget } from '../../redirects'
import { sortDocsNavigation } from '~/utils/docsNavOrder'

export interface DocsSection {
  label: string
  to: string
  match: string | string[]
}

export type DocsVersion = 'v4' | 'v3'

/** First path segment of the archived v3 docs (`content/v3`, its own collection). */
export const V3_PREFIX = '/v3'

export function isV3Path(path: string): boolean {
  return path === V3_PREFIX || path.startsWith(`${V3_PREFIX}/`)
}

/** Home page of each docs version. */
export const VERSION_HOME: Record<DocsVersion, string> = { v4: '/', v3: V3_PREFIX }

/** Content collection of each docs version. */
export const VERSION_COLLECTION = { v4: 'docs', v3: 'v3' } as const

function matchesSection(path: string, match: string | string[]): boolean {
  const prefixes = Array.isArray(match) ? match : [match]
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** Docs version of the current route: everything under `/v3` is the archive. */
export function useDocsVersion() {
  const route = useRoute()
  return computed<DocsVersion>(() => (isV3Path(route.path) ? 'v3' : 'v4'))
}

/** Header sections of the current docs version (`app.config` `sections`). */
export function useDocsSectionList() {
  const version = useDocsVersion()
  const { sections } = useAppConfig() as { sections: Record<DocsVersion, DocsSection[]> }
  return computed(() => sections[version.value])
}

/** Active docs section for the current route, or `undefined` on a version home and unknown paths. */
export function useActiveDocsSection() {
  const route = useRoute()
  const sections = useDocsSectionList()

  return computed(() => {
    const path = route.path.replace(/\/$/, '') || '/'
    return sections.value.find((section) => matchesSection(path, section.match))
  })
}

/** Navigation tree of a docs version: the v4 top level, or the children of the `/v3` folder. */
export function versionTree(
  version: DocsVersion,
  docs: ContentNavigationItem[] | undefined,
  v3: ContentNavigationItem[] | undefined,
): ContentNavigationItem[] {
  if (version === 'v4') return docs ?? []
  return v3?.find((item) => item.path === V3_PREFIX)?.children ?? []
}

/** Navigation tree of the current docs version (from the trees `useDocsNavigation` provides). */
export function useVersionNavigation() {
  const version = useDocsVersion()
  const navigation = inject<Ref<ContentNavigationItem[] | undefined>>('navigation')
  const v3Navigation = inject<Ref<ContentNavigationItem[] | undefined>>('v3Navigation')
  return computed(() => versionTree(version.value, navigation?.value, v3Navigation?.value))
}

type GroupedItem = ContentNavigationItem & { group?: string }

/**
 * Pages of a folder that set `navigation.group` in their frontmatter are gathered under that group,
 * in the order the groups first appear (pages are already sorted by `navigation.order`). A folder
 * whose pages set no group keeps its flat list.
 */
function groupChildren(items: ContentNavigationItem[]): ContentNavigationItem[] {
  if (!items.some((item) => (item as GroupedItem).group)) return items
  const groups: ContentNavigationItem[] = []
  for (const item of items) {
    const name = (item as GroupedItem).group
    if (!name) {
      groups.push(item)
      continue
    }
    let group = groups.find((entry) => entry.children && entry.title === name)
    if (!group) {
      // `path` only keys the accordion item; nothing links to a group.
      group = { title: name, path: `${item.path}#group`, stem: '', children: [] }
      groups.push(group)
    }
    group.children!.push(item)
  }
  return groups
}

function groupTree(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return items.map((item) => (item.children?.length ? { ...item, children: groupChildren(item.children) } : item))
}

/**
 * Sidebar for the current route: the active section of the current docs version. A section that is
 * one folder shows that folder's pages (grouped) instead of a single wrapper item; a version home
 * with no section shows the whole tree.
 */
export function useSectionNavigation() {
  const active = useActiveDocsSection()
  const tree = useVersionNavigation()

  return computed<ContentNavigationItem[]>(() => {
    const section = active.value
    if (!section) return groupTree(tree.value)

    const filtered = sortDocsNavigation(tree.value.filter((item) => matchesSection(item.path, section.match)))
    if (filtered.length === 1 && filtered[0]!.children?.length) return groupChildren(filtered[0]!.children)
    return groupTree(filtered)
  })
}

/** Pages of a sidebar tree in reading order (groups and folders flattened), for prev/next links. */
export function flattenNavigation(items: ContentNavigationItem[]): ContentNavigationItem[] {
  const pages: ContentNavigationItem[] = []
  const walk = (list: ContentNavigationItem[]) => {
    for (const item of list) {
      if (item.children?.length) walk(item.children)
      else if (!pages.some((page) => page.path === item.path)) pages.push(item)
    }
  }
  walk(items)
  return pages
}

/**
 * Where the version switch leads from the current page: the same page in the other version when it
 * exists (through the old-URL redirect map from v3 to v4), else that version's home.
 */
export function useVersionLinks() {
  const route = useRoute()
  const navigation = inject<Ref<ContentNavigationItem[] | undefined>>('navigation')
  const v3Navigation = inject<Ref<ContentNavigationItem[] | undefined>>('v3Navigation')

  return computed<Record<DocsVersion, string>>(() => {
    const path = route.path.replace(/(.)\/$/, '$1')
    const has = (tree: ContentNavigationItem[] | undefined, target: string) => flattenNavigation(tree ?? []).some((page) => page.path === target)

    if (isV3Path(path)) {
      const old = path.slice(V3_PREFIX.length) || '/'
      const target = (redirectTarget(old) ?? old).split('#')[0]!.replace(/(.)\/$/, '$1')
      return { v3: path, v4: target !== '/' && has(navigation?.value, target) ? target : VERSION_HOME.v4 }
    }
    const target = `${V3_PREFIX}${path === '/' ? '' : path}`
    return { v4: path, v3: path !== '/' && has(v3Navigation?.value, target) ? target : VERSION_HOME.v3 }
  })
}
