/**
 * Build-time answers about localized URLs (prerender), from the generated pages themselves:
 * a memory router over them and the runtime path strategy, so build and runtime agree on custom
 * paths, `false` (unlocalized) pages and routeLocales restrictions.
 */
import { createPathStrategy, type PathStrategyContext } from '@i18n-micro/path-strategy'
import type { NuxtPage } from '@nuxt/schema'
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
  // vue-router names may be symbols; the strategy reads them as strings
  const strategy = createPathStrategy({ ...ctx, router: router as unknown as PathStrategyContext['router'] })
  const matched = (path: string) => {
    // prerender lists paths no page has (API routes, files): no vue-router "No match" warning for them
    const warn = console.warn
    console.warn = () => {}
    try {
      return router.resolve(path).matched
    } finally {
      console.warn = warn
    }
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
  }
}
