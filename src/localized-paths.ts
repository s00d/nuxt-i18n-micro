/**
 * Build-time answers about localized URLs (prerender), from the generated pages themselves:
 * a memory router over them and the runtime path strategy, so build and runtime agree on custom
 * paths, `false` (unlocalized) pages and routeLocales restrictions.
 */
import { createPathStrategy, DomainPathStrategy, type PathStrategyContext, type RouteRecordLike } from '@i18n-micro/path-strategy'
import type { Strategies } from '@i18n-micro/types'
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

/** Route names of the pages, nested ones included. */
export function namedPages(pages: NuxtPage[]): string[] {
  return pages.flatMap((page) => [...(page.name ? [page.name] : []), ...namedPages(page.children ?? [])])
}

/**
 * With locale domains the origin of SEO tags on an unknown host comes from the request when nothing
 * fixes it, so the `Host` a client sends reaches canonical and `hreflang`: the owner has to know.
 */
export function unfixedOriginWarning(locales: { code: string; baseUrl?: string }[], defaultLocale: string, metaBaseUrl?: string, siteUrl?: string) {
  if (metaBaseUrl || siteUrl || !locales.some((locale) => locale.baseUrl)) return null
  if (locales.find((locale) => locale.code === defaultLocale)?.baseUrl) return null
  return 'locales[].baseUrl is set, but no public origin is fixed: an unknown host reaches canonical and hreflang from the request. Set metaBaseUrl, site.url, or a baseUrl on the default locale.'
}

export interface PrerenderSeedOptions {
  localize: LocalizedPathResolver
  locales: { code: string; baseDefault?: boolean }[]
  /** The pages to seed, static output only: elsewhere null. */
  staticPaths: string[] | null
  strategy: Strategies
  prerendered: (route: string) => boolean
  isInternal: (route: string) => boolean
}

/**
 * Static generation needs an entry point the crawler can actually follow.
 * With `prefix`, `/` only answers with a redirect to `/<defaultLocale>`:
 * Nitro writes the redirect stub but never enqueues its target, so nothing
 * beyond the explicitly listed routes is prerendered. Seed the localized
 * roots instead (never `/` itself in an SSR build — prerendering that would
 * shadow the dynamic handler with a static redirect).
 */
function seedStaticRoutes(routes: Set<string>, staticPaths: string[], options: PrerenderSeedOptions): void {
  const { localize, prerendered } = options
  // `/` itself is kept so a static host still answers the bare root (the redirect stub).
  if (prerendered('/')) routes.add('/')
  for (const path of staticPaths) {
    if (!prerendered(path)) continue
    // a page's path as written need not be served (`/page` with `en: '/page/:id'`, anything under `prefix`)
    if (localize.isServed(path)) routes.add(path)
    addLocalized(routes, path, options)
  }
  addLocalized(routes, '/', options)
}

/** `path` in every locale, where that URL is prerendered. */
function addLocalized(routes: Set<string>, path: string, { localize, locales, prerendered }: PrerenderSeedOptions): void {
  for (const { code } of locales) {
    const localized = localize.path(path, code)
    if (localized && prerendered(localized)) routes.add(localized)
  }
}

/** Removes what the strategy serves under a prefix only. `/` (the redirect stub), unlocalized pages and non-page routes (API, files) stay. */
function dropUnprefixed(routes: Set<string>, localize: LocalizedPathResolver): string[] {
  const removed = [...routes].filter(
    (route) => route !== '/' && route !== '' && !localize.localeOf(route) && !localize.isUnlocalized(route) && localize.isPage(route),
  )
  for (const route of removed) routes.delete(route)
  return removed
}

/** Completes the prerender list in place: every locale of what it holds. Answers what it added and removed. */
export function seedPrerenderRoutes(routes: Set<string>, options: PrerenderSeedOptions): { added: string[]; removed: string[] } {
  const { localize, staticPaths, prerendered, isInternal } = options
  if (staticPaths) seedStaticRoutes(routes, staticPaths, options)

  for (const route of routes) if (isInternal(route)) routes.delete(route)

  const additional = new Set<string>()
  for (const route of routes) {
    if (/\.[a-z0-9]+$/i.test(route) || !prerendered(route) || localize.localeOf(route)) continue
    addLocalized(additional, route, options)
  }
  for (const route of additional) routes.add(route)

  // pages are served under a prefix only, or links use it: `prefix_and_default` with a host default links to its unprefixed URL
  const { strategy, locales } = options
  const prefixedOnly = strategy === 'prefix' || (strategy === 'prefix_and_default' && !locales.some((locale) => locale.baseDefault))
  return { added: [...additional], removed: prefixedOnly ? dropUnprefixed(routes, localize) : [] }
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
  const strategy = ctx.locales.some((locale) => locale.baseUrl) ? new DomainPathStrategy({ ...ctx, router }) : createPathStrategy({ ...ctx, router })
  // asked per path and per locale (prerender): one resolve per path. Build time, so unbounded.
  const seen = new Map<string, RouteRecordLike[]>()
  const matched = (path: string) => {
    let records = seen.get(path)
    if (records) return records
    // prerender lists paths no page has (API routes, files): no vue-router "No match" warning for them
    records = strategy.probe(path)?.matched ?? []
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
      // another domain's URL: not this site's to prerender
      return target && target !== path && !target.startsWith('https:') && !target.startsWith('http:') ? target : null
    },
    localeOf: (path) => strategy.getLocaleFromPath(path),
    isUnlocalized,
    isPage,
    // a known domain also leaves out what it answers with a 404 or a redirect (another host's URL)
    isServed: (path) =>
      matched(path).length > 0 && (!ctx.domain || (!strategy.shouldReturn404(path) && !strategy.getClientRedirect(path, ctx.defaultLocale))),
  }
}
