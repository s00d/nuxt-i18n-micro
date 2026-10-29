/**
 * Runtime locale routing on top of the routes route-strategy generated. Every localized record
 * carries `meta.i18n = { name, locales }`, so the router itself is the source of truth: an index
 * built once from `router.getRoutes()` maps a page (base name) and a locale to the record that
 * serves it, and every answer is one Map lookup plus one `router.resolve`.
 */
import type { Locale, Strategies } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteI18nMeta, RouteLike, RouterAdapter, SwitchLocaleOptions } from './types'

interface Entry {
  /** Base route name of the page. */
  base: string
  locales: string[]
  /** Param names of the record path (`locale` included when prefixed). */
  keys: string[]
  /** Catch-all record: other pages win over it when a URL is looked up. */
  catchAll: boolean
}

interface Index {
  records: Map<string, Entry>
  /** base -> locale -> record name */
  pages: Map<string, Map<string, string>>
  /** Named records that are not localized (`false` rules, excluded pages). */
  unlocalized: Set<string>
}

type Target = RouteLike & { path: string; fullPath: string }

interface Page {
  base: string
  params: Record<string, unknown>
  catchAll: boolean
}

const UNLOCALIZED = 'unlocalized' as const

function splitUrl(url: string): { path: string; query?: Record<string, unknown>; hash?: string } {
  const hashAt = url.indexOf('#')
  const hash = hashAt === -1 ? undefined : url.slice(hashAt)
  const rest = hashAt === -1 ? url : url.slice(0, hashAt)
  const queryAt = rest.indexOf('?')
  if (queryAt === -1) return { path: rest, hash }
  // no prototype: `?constructor=x` and `?__proto__=x` are plain keys
  const query: Record<string, unknown> = Object.create(null)
  for (const [key, value] of new URLSearchParams(rest.slice(queryAt + 1))) {
    const seen = query[key]
    // `?tag=a&tag=b` -> { tag: ['a', 'b'] }, as vue-router parses it
    query[key] = seen === undefined ? value : Array.isArray(seen) ? [...seen, value] : [seen, value]
  }
  return { path: rest.slice(0, queryAt), query, hash }
}

const withoutTrailingSlash = (path: string) => (path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path)

export class I18nPathStrategy {
  private readonly ctx: PathStrategyContext
  private readonly codes: Set<string>
  private readonly prefix: string
  private index_: Index | undefined
  /** URL -> page and URL -> 404 reason: matching a path walks every record, a cache hit does not. */
  private readonly pageCache = new Map<string, Page | typeof UNLOCALIZED | null>()
  private readonly notFoundCache = new Map<string, string | null>()
  /** record + params + query + hash -> resolved target: one router.resolve per distinct link */
  private readonly targetCache = new Map<string, Target | null>()

  constructor(ctx: PathStrategyContext) {
    this.ctx = ctx
    this.codes = new Set(ctx.locales.filter((l) => !l.disabled).map((l) => l.code))
    this.prefix = ctx.localizedRouteNamePrefix ?? 'localized-'
  }

  setRouter(router: RouterAdapter): void {
    this.ctx.router = router
    this.index_ = undefined
    this.pageCache.clear()
    this.notFoundCache.clear()
    this.targetCache.clear()
  }

  getDefaultLocale(): string {
    return this.ctx.defaultLocale
  }

  getLocales(): Locale[] {
    return this.ctx.locales
  }

  getStrategy(): Strategies {
    return this.ctx.strategy
  }

  getLocalizedRouteNamePrefix(): string {
    return this.prefix
  }

  // ponytail: built once per router; routes added later with router.addRoute need setRouter() to be seen
  private get index(): Index {
    if (this.index_) return this.index_
    const index: Index = { records: new Map(), pages: new Map(), unlocalized: new Set() }
    for (const record of this.ctx.router.getRoutes()) {
      if (record.aliasOf || record.name === null || record.name === undefined) continue
      const name = String(record.name)
      const i18n = record.meta?.i18n as RouteI18nMeta | undefined
      if (!i18n) {
        if (!record.redirect) index.unlocalized.add(name)
        continue
      }
      const keys = Array.from(record.path.matchAll(/:(\w+)/g), (m) => m[1]!)
      index.records.set(name, { base: i18n.name, locales: i18n.locales, keys, catchAll: record.path.includes('(.*)') })
      let byLocale = index.pages.get(i18n.name)
      if (!byLocale) index.pages.set(i18n.name, (byLocale = new Map()))
      // prefix_and_default serves the default locale twice: links use the prefixed record
      for (const locale of i18n.locales) if (!byLocale.has(locale) || keys.includes('locale')) byLocale.set(locale, name)
    }
    return (this.index_ = index)
  }

  /** Whether URLs in `locale` carry the locale segment. */
  private hasPrefix(locale: string): boolean {
    const { strategy } = this.ctx
    return strategy === 'prefix' || strategy === 'prefix_and_default' || (strategy === 'prefix_except_default' && locale !== this.ctx.defaultLocale)
  }

  private resolve(to: RouteLike | string): ResolvedRouteLike | null {
    try {
      return this.ctx.router.resolve(to)
    } catch {
      return null
    }
  }

  /** Resolves a URL that may match nothing, without vue-router's dev "No match found" warning. */
  private probe(to: RouteLike | string): ResolvedRouteLike | null {
    // ponytail: swaps console.warn around a synchronous call; a router that warns through another channel still warns
    const warn = console.warn
    console.warn = () => {}
    try {
      return this.resolve(to)
    } finally {
      console.warn = warn
    }
  }

  /** The page a URL shows: its own record, else the record it has in another locale's form. */
  private findPage(path: string): Page | typeof UNLOCALIZED | null {
    let page = this.pageCache.get(path)
    if (page === undefined) remember(this.pageCache, path, (page = this.matchPage(path)))
    return page
  }

  private matchPage(path: string): Page | typeof UNLOCALIZED | null {
    const { records, unlocalized } = this.index
    const forms = [path]
    const locale = this.getLocaleFromPath(path)
    // a prefix this URL should not have (`/en/...`, any prefix under no_prefix)
    if (locale) forms.push(path.slice(locale.length + 1) || '/')
    else if (this.ctx.strategy !== 'no_prefix') for (const code of this.codes) forms.push(`/${code}${path === '/' ? '' : path}`)
    let catchAll: Page | null = null
    for (const form of forms) {
      const route = this.probe(form)
      const name = route?.name
      if (!name) continue
      if (form === path && unlocalized.has(name)) return UNLOCALIZED
      const entry = records.get(name)
      if (!entry) continue
      const { locale: _locale, ...params } = route.params ?? {}
      const page = { base: entry.base, params, catchAll: entry.catchAll }
      if (!entry.catchAll) return page
      catchAll ??= page
    }
    return catchAll
  }

  private baseOf(name: string): string | null {
    const entry = this.index.records.get(name)
    if (entry) return entry.base
    return this.index.pages.has(name) ? name : null
  }

  /** Page `base` in `locale`, resolved by the router (the current route's params fill missing ones). */
  private routeTo(locale: string, base: string, params: Record<string, unknown>, query?: Record<string, unknown>, hash?: string): Target | null {
    const byLocale = this.index.pages.get(base)
    const name = byLocale?.get(locale) ?? byLocale?.get(this.ctx.defaultLocale) ?? byLocale?.values().next().value
    if (!name) return null
    const entry = this.index.records.get(name)!
    const own: Record<string, unknown> = {}
    for (const key of entry.keys) {
      if (key === 'locale') own.locale = [locale, this.ctx.defaultLocale].find((code) => entry.locales.includes(code)) ?? entry.locales[0]
      else if (params[key] !== undefined) own[key] = params[key]
    }
    // the current route's params fill missing ones inside router.resolve, so a cached miss of a
    // param-less call could differ per page: only cache when every record param is given
    const complete = entry.keys.every((key) => own[key] !== undefined)
    const cacheKey = complete ? `${name}\0${JSON.stringify(own)}\0${query ? JSON.stringify(query) : ''}\0${hash ?? ''}` : ''
    let target = complete ? this.targetCache.get(cacheKey) : undefined
    if (target === undefined) {
      const route = this.resolve({ name, params: own, query, hash })
      // name + every param: router.push / NuxtLink resolve it by name (a Map lookup), not by matching the path
      target = route ? { name, params: route.params, path: route.path, fullPath: route.fullPath, query: route.query, hash: route.hash } : null
      if (complete) remember(this.targetCache, cacheKey, target)
    }
    // callers may add fields (the plugin sets `force`): never hand out the cached object
    return target && { ...target }
  }

  /** A route in `locale` on that locale's own domain (`baseUrl`), as an absolute URL. */
  private external(locale: string, route: Target): string | null {
    const config = this.ctx.locales.find((l) => l.code === locale)
    if (!config?.baseUrl) return null
    const strip =
      config.baseDefault &&
      this.hasPrefix(locale) &&
      (route.fullPath === `/${locale}` ||
        route.fullPath.startsWith(`/${locale}/`) ||
        route.fullPath.startsWith(`/${locale}?`) ||
        route.fullPath.startsWith(`/${locale}#`))
    const fullPath = strip ? route.fullPath.slice(locale.length + 1) || '/' : route.fullPath
    return `${config.baseUrl.replace(/\/+$/, '')}${fullPath.startsWith('/') ? fullPath : `/${fullPath}`}`
  }

  /** The unknown path in `locale`'s form: only the prefix changes. */
  private prefixed(locale: string, path: string): string {
    const loc = this.getLocaleFromPath(path)
    const rest = loc ? path.slice(loc.length + 1) || '/' : path || '/'
    if (!this.hasPrefix(locale)) return rest
    return rest === '/' ? `/${locale}` : `/${locale}${rest.startsWith('/') ? rest : `/${rest}`}`
  }

  switchLocaleRoute(_fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions = {}): RouteLike | string {
    const name = route.name ? String(route.name) : null
    const base = name ? this.baseOf(name) : null
    if (!base) {
      // an unlocalized page stays; an unmatched URL (a 404 page) becomes that URL in `toLocale`'s form
      // a URL no record matches: a route with a name, or matched records (an unnamed parent), stays
      if (name || route.matched?.length) return route
      const target = this.localeRoute(toLocale, route.fullPath || route.path)
      return target.path && /^https?:\/\//.test(target.path) ? target.path : target
    }
    const params = { ...route.params, ...options.i18nRouteParams?.[toLocale] }
    const target = this.routeTo(toLocale, base, params, route.query, route.hash)
    if (!target) return route
    return this.external(toLocale, target) ?? target
  }

  localeRoute(targetLocale: string, routeOrPath: RouteLike | string, _currentRoute?: ResolvedRouteLike): RouteLike {
    const input: RouteLike = typeof routeOrPath === 'string' ? splitUrl(routeOrPath) : routeOrPath
    const name = typeof routeOrPath === 'string' ? null : routeOrPath.name
    let target: Target | null = null
    if (name) {
      const base = this.baseOf(String(name))
      if (base) target = this.routeTo(targetLocale, base, input.params ?? {}, input.query, input.hash)
      else if (this.ctx.router.hasRoute(String(name))) target = this.resolve(routeOrPath)
    } else if (input.path !== undefined) {
      const page = this.findPage(input.path)
      if (page && page !== UNLOCALIZED) target = this.routeTo(targetLocale, page.base, page.params, input.query, input.hash)
      else {
        const path = page === UNLOCALIZED ? input.path : this.prefixed(targetLocale, input.path)
        target = this.probe({ path, query: input.query, hash: input.hash }) ?? { path, fullPath: path }
      }
    }
    if (!target) return routeOrPath as RouteLike
    const url = this.external(targetLocale, target)
    return url ? { path: url, fullPath: url } : target
  }

  getRouteBaseName(route: RouteLike, _locale?: string): string | null {
    if (route.name) return this.baseOf(String(route.name)) ?? String(route.name)
    if (!route.path) return null
    const page = this.findPage(splitUrl(route.path).path)
    return page && page !== UNLOCALIZED ? page.base : null
  }

  /** Translation key of the route: its base name (`index` when page translations are off). */
  getPluginRouteName(route: ResolvedRouteLike, locale: string): string {
    if (this.ctx.disablePageLocales) return 'index'
    if (!route.name) return this.getRouteBaseName(route) ?? ''
    const name = String(route.name)
    const base = this.baseOf(name)
    if (base) return base
    // a localized name the router does not know: strip prefix and locale suffix
    const stripped = name.startsWith(this.prefix) ? name.slice(this.prefix.length) : name
    return stripped.endsWith(`-${locale}`) ? stripped.slice(0, -locale.length - 1) : stripped
  }

  getCurrentLocale(route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string {
    const { strategy, defaultLocale } = this.ctx
    if (this.ctx.hashMode || strategy === 'no_prefix') return defaultLocaleOverride || defaultLocale
    const path = route.path || route.fullPath || ''
    if (strategy === 'prefix_and_default' && (path === '/' || path === '') && defaultLocaleOverride) return defaultLocaleOverride
    const param = route.params?.locale
    const fromParams = Array.isArray(param) ? String(param[0] ?? '') : param ? String(param) : ''
    if (this.codes.has(fromParams)) return fromParams
    const fromPath = this.getLocaleFromPath(path)
    if (fromPath) return fromPath
    return strategy === 'prefix_except_default' ? defaultLocale : defaultLocaleOverride || defaultLocale
  }

  getCurrentLocaleName(route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string | null {
    const code = this.getCurrentLocale(route, defaultLocaleOverride)
    return this.ctx.locales.find((l) => l.code === code)?.displayName ?? null
  }

  /** Locale code in the first path segment, or null. */
  getLocaleFromPath(path: string): string | null {
    const segment = splitUrl(path).path.split('/')[1] ?? ''
    return this.codes.has(segment) ? segment : null
  }

  /** Locale a URL is in: its prefix, or the default under prefix_except_default; null under no_prefix. */
  resolveLocaleFromPath(path: string): string | null {
    if (this.ctx.strategy === 'no_prefix') return null
    return this.getLocaleFromPath(path) ?? (this.ctx.strategy === 'prefix_except_default' ? this.ctx.defaultLocale : null)
  }

  /** A path written in `fromLocale`'s form without its prefix, made resolvable by the router. */
  formatPathForResolve(path: string, fromLocale: string, _toLocale: string): string {
    if (!this.hasPrefix(fromLocale) || this.getLocaleFromPath(path)) return path
    return path === '/' ? `/${fromLocale}` : `/${fromLocale}${path}`
  }

  /** Why a prefixed URL must be a 404, or null. */
  shouldReturn404(currentPath: string): string | null {
    if (this.ctx.strategy === 'no_prefix') return null
    const path = splitUrl(currentPath).path
    let reason = this.notFoundCache.get(path)
    if (reason === undefined) remember(this.notFoundCache, path, (reason = this.notFoundReason(path)))
    return reason
  }

  private notFoundReason(path: string): string | null {
    const locale = this.getLocaleFromPath(path)
    if (!locale) return null
    if (this.ctx.strategy === 'prefix_except_default' && locale === this.ctx.defaultLocale) return 'Default locale should not have prefix'
    const name = this.probe(path)?.name
    const entry = name ? this.index.records.get(name) : undefined
    if (entry && !entry.catchAll) return null
    // a second prefix (`/de/de/about`) is no page at all: leave it to the router
    const rest = path.slice(locale.length + 1) || '/'
    if (this.getLocaleFromPath(rest)) return null
    const page = this.findPage(rest)
    if (page === UNLOCALIZED) return 'Unlocalized route cannot have locale prefix'
    if (page && !page.catchAll && !this.index.pages.get(page.base)?.has(locale)) return 'Locale not allowed for this route'
    return null
  }

  /**
   * Where an unprefixed URL goes for the preferred locale (server plugin and client middleware),
   * or null to stay. URLs with a locale prefix are never rewritten here.
   */
  getClientRedirect(currentPath: string, preferredLocale: string): string | null {
    if (this.ctx.strategy === 'no_prefix' || this.ctx.strategy === 'prefix_and_default') return null
    const path = splitUrl(currentPath).path || '/'
    if (this.getLocaleFromPath(path)) return null
    const page = this.findPage(path)
    if (page === UNLOCALIZED) return null
    // a URL no record serves still moves to the preferred locale's form: `prefix` serves nothing
    // unprefixed, and `pages: false` / apps without an index page rely on `/` -> `/de`
    const target = withoutTrailingSlash((page && this.routeTo(preferredLocale, page.base, page.params)?.path) || this.prefixed(preferredLocale, path))
    return safeDecode(target) === safeDecode(withoutTrailingSlash(path)) ? null : target
  }
}

// ponytail: dropped wholesale when full; an LRU only pays off for apps with more distinct URLs than this
const CACHE_SIZE = 1000
function remember<T>(cache: Map<string, T>, key: string, value: T): void {
  if (cache.size >= CACHE_SIZE) cache.clear()
  cache.set(key, value)
}

function safeDecode(path: string): string {
  try {
    return decodeURI(path)
  } catch {
    return path
  }
}

/**
 * The public surface, structural: the Nuxt template imports the built `.mjs` by path, and a
 * class type with private members would not match the one TypeScript infers from that file.
 */
export type PathStrategy = { [K in keyof I18nPathStrategy]: I18nPathStrategy[K] }

export function createPathStrategy(ctx: PathStrategyContext): PathStrategy {
  return new I18nPathStrategy(ctx)
}
