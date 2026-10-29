/**
 * Runtime locale routing on top of the routes route-strategy generated. Every localized record
 * carries `meta.i18n = { name, locales }`, so the router itself is the source of truth: an index
 * built once from `router.getRoutes()` maps a page (base name) and a locale to the record that
 * serves it, and every answer is one Map lookup plus one `router.resolve`.
 */
import type { Locale, Strategies } from '@i18n-micro/types'
import type {
  ClientRedirectOptions,
  PathStrategyContext,
  ResolvedRouteLike,
  RouteI18nMeta,
  RouteLike,
  RouterAdapter,
  SwitchLocaleOptions,
} from './types'

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
  /**
   * Locales an unprefixed URL is tried in: one per distinct `/:locale(a|b)` record set (any of
   * its codes matches the same record) and every locale with records of its own (custom paths).
   */
  probeCodes: string[]
  records: Map<string, Entry>
  /** base -> locale -> record name */
  pages: Map<string, Map<string, string>>
  /** base -> `disableMeta` of the page */
  noMeta: Map<string, boolean | string[]>
  /** Named records that are not localized (`false` rules, excluded pages). */
  unlocalized: Set<string>
}

/**
 * The index and the URL caches of one route table. Shared by every strategy built on the same
 * routes (each SSR request gets a new router, never new routes), so a request starts warm.
 */
interface Shared {
  index: Index
  /** URL -> page and URL -> 404 reason: matching a path walks every record, a cache hit does not. */
  pages: Map<string, Page | typeof UNLOCALIZED | null>
  notFound: Map<string, string | null>
  /** record + params + query + hash -> resolved target: one router.resolve per distinct link */
  targets: Map<string, Target | null>
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
  private readonly unknownLocale: RegExp | null
  private shared_: Shared | undefined

  constructor(ctx: PathStrategyContext) {
    this.ctx = ctx
    this.codes = new Set(ctx.locales.filter((l) => !l.disabled).map((l) => l.code))
    this.prefix = ctx.localizedRouteNamePrefix ?? 'localized-'
    // `/re/` and `re` alike, as route-strategy reads it
    this.unknownLocale = ctx.customRegexMatcher ? new RegExp(`^(?:${ctx.customRegexMatcher.replace(/^\/(.*)\/$/, '$1')})$`) : null
  }

  setRouter(router: RouterAdapter): void {
    this.ctx.router = router
    this.shared_ = undefined
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

  // ponytail: read once per router; routes added later with router.addRoute need setRouter() to be seen
  private get shared(): Shared {
    if (this.shared_) return this.shared_
    // the caches answer for this config too: the same routes under another default locale are another table
    const { strategy, defaultLocale, customRegexMatcher = '' } = this.ctx
    const config = `${strategy}\0${defaultLocale}\0${[...this.codes].join(',')}\0${customRegexMatcher}\0${this.prefix}`
    // vue-router keeps the route array it was created with: every SSR request's router has the
    // same one, so it keys the table without walking the records (a router without it: a signature)
    const routes = (this.ctx.router as { options?: { routes?: unknown } }).options?.routes
    const byConfig = routes && typeof routes === 'object' ? tablesOf(routes as object) : SIGNED
    const key = byConfig === SIGNED ? `${config}\0${signatureOf(this.ctx.router.getRoutes())}` : config
    let shared = byConfig.get(key)
    if (!shared) {
      const records = this.ctx.router.getRoutes().filter((record) => !record.aliasOf && record.name !== null && record.name !== undefined)
      shared = { index: buildIndex(records), pages: new Map(), notFound: new Map(), targets: new Map() }
      remember(byConfig, key, shared, SHARED_SIZE)
    }
    return (this.shared_ = shared)
  }

  private get index(): Index {
    return this.shared.index
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
    const cache = this.shared.pages
    let page = cache.get(path)
    if (page === undefined) remember(cache, path, (page = this.matchPage(path)))
    return page
  }

  private matchPage(path: string): Page | typeof UNLOCALIZED | null {
    const { records, unlocalized } = this.index
    const forms = [path]
    const locale = this.getLocaleFromPath(path)
    // a prefix this URL should not have (`/en/...`, any prefix under no_prefix)
    if (locale) forms.push(path.slice(locale.length + 1) || '/')
    else if (this.ctx.strategy !== 'no_prefix') for (const code of this.index.probeCodes) forms.push(`/${code}${path === '/' ? '' : path}`)
    let catchAll: Page | null = null
    for (const form of forms) {
      const route = this.probe(form)
      // records are indexed by their names as strings (vue-router names may be symbols)
      const name = route?.name ? String(route.name) : ''
      if (!name) continue
      if (form === path && unlocalized.has(name)) return UNLOCALIZED
      const entry = records.get(name)
      if (!entry) continue
      const { locale: _locale, ...params } = route!.params ?? {}
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

  /** Base name of the page a route shows, or null (unlocalized, unknown). */
  private pageBase(route: RouteLike): string | null {
    if (route.name) return this.baseOf(String(route.name))
    const page = route.path ? this.findPage(splitUrl(route.path).path) : null
    return page && page !== UNLOCALIZED ? page.base : null
  }

  /** Locales the page of `route` is served in (every record of it), or null when it is not localized. */
  pageLocales(route: RouteLike): string[] | null {
    const base = this.pageBase(route)
    return base ? [...this.index.pages.get(base)!.keys()] : null
  }

  /** Whether `$defineI18nRoute({ disableMeta })` turns the SEO tags of this page off in `locale`. */
  isMetaDisabled(route: RouteLike, locale: string): boolean {
    const base = this.pageBase(route)
    // an unlocalized page carries its disableMeta on its own record
    const noMeta = base ? this.index.noMeta.get(base) : (route.meta?.i18nNoMeta as boolean | string[] | undefined)
    return noMeta === true || (Array.isArray(noMeta) && noMeta.includes(locale))
  }

  /** Page `base` in `locale` (null when the page is not served there), resolved by the router. */
  private routeTo(locale: string, base: string, params: Record<string, unknown>, query?: Record<string, unknown>, hash?: string): Target | null {
    const name = this.index.pages.get(base)?.get(locale)
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
    const cache = this.shared.targets
    let target = complete ? cache.get(cacheKey) : undefined
    if (target === undefined) {
      const route = this.resolve({ name, params: own, query, hash })
      // name + every param: router.push / NuxtLink resolve it by name (a Map lookup), not by matching the path
      target = route ? { name, params: route.params, path: route.path, fullPath: route.fullPath, query: route.query, hash: route.hash } : null
      if (complete) remember(cache, cacheKey, target)
    }
    // the cache is process-wide (shared by SSR requests): callers get their own params / query
    return target && { ...target, params: { ...target.params }, query: target.query && { ...target.query } }
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
      const url = route.fullPath || route.path
      if (name || route.matched?.length || !url) return route
      const target = this.localeRoute(toLocale, url)
      return target.path && /^https?:\/\//.test(target.path) ? target.path : target
    }
    const params = { ...route.params, ...options.i18nRouteParams?.[toLocale] }
    const target = this.routeTo(toLocale, base, params, route.query, route.hash)
    const resolved = target ?? this.home(toLocale)
    return this.external(toLocale, resolved) ?? resolved
  }

  /** `locale`'s home: where a page that locale does not serve leads, never another locale's page. */
  private home(locale: string): Target {
    const path = this.prefixed(locale, '/')
    const page = this.findPage(path)
    return (page && page !== UNLOCALIZED && this.routeTo(locale, page.base, page.params)) || { path, fullPath: path }
  }

  localeRoute(targetLocale: string, routeOrPath: RouteLike | string, _currentRoute?: ResolvedRouteLike): RouteLike {
    const input: RouteLike = typeof routeOrPath === 'string' ? splitUrl(routeOrPath) : routeOrPath
    const name = typeof routeOrPath === 'string' ? null : routeOrPath.name
    let target: Target | null = null
    if (name) {
      const base = this.baseOf(String(name))
      if (base) target = this.routeTo(targetLocale, base, input.params ?? {}, input.query, input.hash) ?? this.home(targetLocale)
      else if (this.ctx.router.hasRoute(String(name))) target = this.resolve(routeOrPath)
    } else if (input.path !== undefined) {
      const page = this.findPage(input.path)
      if (page && page !== UNLOCALIZED)
        target = this.routeTo(targetLocale, page.base, page.params, input.query, input.hash) ?? this.home(targetLocale)
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

  /** Why a URL must be a 404 (a prefix that is wrong for it, an unknown locale-like segment), or null. */
  shouldReturn404(currentPath: string): string | null {
    const path = splitUrl(currentPath).path
    const cache = this.shared.notFound
    let reason = cache.get(path)
    if (reason === undefined) remember(cache, path, (reason = this.notFoundReason(path)))
    return reason
  }

  private notFoundReason(path: string): string | null {
    const segment = path.split('/')[1] ?? ''
    if (this.unknownLocale && segment && !this.codes.has(segment) && this.unknownLocale.test(segment)) return 'Unknown locale'
    if (this.ctx.strategy === 'no_prefix') return null
    const locale = this.getLocaleFromPath(path)
    if (!locale) return null
    if (this.ctx.strategy === 'prefix_except_default' && locale === this.ctx.defaultLocale) return 'Default locale should not have prefix'
    const name = this.probe(path)?.name
    const entry = name ? this.index.records.get(String(name)) : undefined
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
  getClientRedirect(currentPath: string, preferredLocale: string, options: ClientRedirectOptions = {}): string | null {
    if (this.ctx.strategy === 'no_prefix') return null
    const path = splitUrl(currentPath).path || '/'
    const locale = this.getLocaleFromPath(path)
    if (locale) return options.switchPrefixed && locale !== preferredLocale ? this.moved(path, preferredLocale) : null
    if (this.ctx.strategy === 'prefix_and_default') return null
    return this.moved(path, preferredLocale)
  }

  /** The URL of the page `path` shows, in `locale`; null to stay (same URL, unlocalized, not served in `locale`). */
  private moved(path: string, locale: string): string | null {
    const page = this.findPage(path)
    if (page === UNLOCALIZED) return null
    const served = page ? this.index.pages.get(page.base)! : null
    if (page && served && !served.has(locale)) {
      // a page `locale` does not serve: under `prefix` nothing is served unprefixed, so the page in a
      // locale that has it (the default first); elsewhere the URL already shows it
      if (this.ctx.strategy !== 'prefix') return null
      locale = served.has(this.ctx.defaultLocale) ? this.ctx.defaultLocale : served.keys().next().value!
    }
    // a URL no record serves still moves to the preferred locale's form: `prefix` serves nothing
    // unprefixed, and `pages: false` / apps without an index page rely on `/` -> `/de`
    const target = withoutTrailingSlash((page && this.routeTo(locale, page.base, page.params)?.path) || this.prefixed(locale, path))
    return safeDecode(target) === safeDecode(withoutTrailingSlash(path)) ? null : target
  }
}

function buildIndex(records: ReturnType<RouterAdapter['getRoutes']>): Index {
  const index: Index = { probeCodes: [], records: new Map(), pages: new Map(), noMeta: new Map(), unlocalized: new Set() }
  const probe = new Set<string>()
  const sharedSets = new Set<string>()
  for (const record of records) {
    const name = String(record.name)
    const i18n = record.meta?.i18n as RouteI18nMeta | undefined
    if (!i18n) {
      if (!record.redirect) index.unlocalized.add(name)
      continue
    }
    const keys = Array.from(record.path.matchAll(/:(\w+)/g), (m) => m[1]!)
    index.records.set(name, { base: i18n.name, locales: i18n.locales, keys, catchAll: record.path.includes('(.*)') })
    const set = i18n.locales.join('|')
    if (keys.includes('locale') && !sharedSets.has(set) && i18n.locales[0]) {
      sharedSets.add(set)
      probe.add(i18n.locales[0])
    }
    for (const code of i18n.locales) if (record.path === `/${code}` || record.path.startsWith(`/${code}/`)) probe.add(code)
    if (i18n.noMeta !== undefined) index.noMeta.set(i18n.name, i18n.noMeta)
    let byLocale = index.pages.get(i18n.name)
    if (!byLocale) index.pages.set(i18n.name, (byLocale = new Map()))
    // prefix_and_default serves the default locale twice: links use the prefixed record
    for (const locale of i18n.locales) if (!byLocale.has(locale) || keys.includes('locale')) byLocale.set(locale, name)
  }
  index.probeCodes = [...probe]
  return index
}

/** Route tables seen in this process, by their route array and config (one per app; dev reloads add more). */
const TABLES = new WeakMap<object, Map<string, Shared>>()
/** Routers without `options.routes`: by a signature of their records. */
const SIGNED = new Map<string, Shared>()
const SHARED_SIZE = 4

function tablesOf(routes: object): Map<string, Shared> {
  let tables = TABLES.get(routes)
  if (!tables) TABLES.set(routes, (tables = new Map()))
  return tables
}

/** Every record, aliases included (the URL caches see them through router.resolve), and its meta.i18n. */
function signatureOf(records: ReturnType<RouterAdapter['getRoutes']>): string {
  return records.map((record) => `${String(record.name)}\0${record.path}\0${JSON.stringify(record.meta?.i18n ?? null)}`).join('\0')
}

// ponytail: dropped wholesale when full; an LRU only pays off for apps with more distinct URLs than this
const CACHE_SIZE = 1000
function remember<T>(cache: Map<string, T>, key: string, value: T, size = CACHE_SIZE): void {
  if (cache.size >= size) cache.clear()
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
