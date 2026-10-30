/**
 * Build-time answers about localized URLs (prerender), from the generated pages themselves:
 * a memory router over them and the runtime path strategy, so build and runtime agree on custom
 * paths, `false` (unlocalized) pages and routeLocales restrictions.
 */
import { createPathStrategy, type PathStrategyContext } from '@i18n-micro/path-strategy'
import type { NuxtPage } from '@nuxt/schema'
import { joinURL } from 'ufo'
import type { RouteRecordRaw } from 'vue-router'

export interface LocalizedPathResolver {
  /** URL of the page `path` shows, in `locale`; null when the page is not served there or keeps its URL. */
  path: (path: string, locale: string) => string | null
  /** Locale prefix of the URL, or null. */
  localeOf: (path: string) => string | null
  /** Whether the URL shows a page that is not localized (served as written). */
  isUnlocalized: (path: string) => boolean
  /** Whether any page matches the URL (API routes and files do not). */
  isPage: (path: string) => boolean
  /** Whether a record serves this very URL, not only its page in another form. */
  isServed: (path: string) => boolean
}

/** URLs of the pages without params, nested ones included. Nuxt seeds generate with one page: the crawler only finds linked ones. */
export function staticPagePaths(pages: NuxtPage[], parent = '/'): string[] {
  return pages.flatMap((page) => {
    if (page.redirect || page.path.includes(':')) return []
    const path = joinURL(parent, page.path)
    return [path, ...staticPagePaths(page.children ?? [], path)]
  })
}

const toRecord = (page: NuxtPage): RouteRecordRaw =>
  ({
    path: page.path,
    name: page.name,
    meta: page.meta,
    ...(page.redirect ? { redirect: page.redirect } : { component: {} }),
    ...(page.alias?.length ? { alias: page.alias } : {}),
    ...(page.children?.length ? { children: page.children.map(toRecord) } : {}),
  }) as RouteRecordRaw

export async function createLocalizedPathResolver(pages: NuxtPage[], ctx: Omit<PathStrategyContext, 'router'>): Promise<LocalizedPathResolver> {
  const { createMemoryHistory, createRouter } = await import('vue-router')
  const router = createRouter({ history: createMemoryHistory(), routes: pages.map(toRecord) })
  const strategy = createPathStrategy({ ...ctx, router })
  // asked per path and per locale (prerender): one resolve per path. Build time, so unbounded.
  const seen = new Map<string, ReturnType<typeof router.resolve>['matched']>()
  const matched = (path: string) => {
    let records = seen.get(path)
    if (records) return records
    // prerender lists paths no page has (API routes, files): no vue-router "No match" warning for them
    const warn = console.warn
    console.warn = () => {}
    try {
      records = router.resolve(path).matched
    } finally {
      console.warn = warn
    }
    seen.set(path, records)
    return records
  }
  // a page in any locale's form counts (under `prefix` nothing is served unprefixed)
  const isPage = (path: string) => matched(path).length > 0 || strategy.pageLocales({ path }) !== null
  const isUnlocalized = (path: string) => {
    const records = matched(path)
    return records.length > 0 && !records.at(-1)!.meta?.i18n
  }
  return {
    path(path, locale) {
      const served = strategy.pageLocales({ path })
      if (!isPage(path) || (served && !served.includes(locale)) || isUnlocalized(path)) return null
      const target = strategy.localeRoute(locale, path).fullPath
      return target && target !== path ? target : null
    },
    localeOf: (path) => strategy.getLocaleFromPath(path),
    isUnlocalized,
    isPage,
    isServed: (path) => matched(path).length > 0,
  }
}
