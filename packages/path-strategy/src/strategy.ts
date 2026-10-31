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
  /** Path of a page with no URL under it -> base: what the redirect record says when there is none (`redirects: false`). */
  originals: Map<string, string>
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

/** Strategies that serve the default locale unprefixed: such a URL is its page, whatever is stored (the server agrees). */
const unprefixedIsDefault = (strategy: Strategies) => strategy === 'prefix_except_default' || strategy === 'prefix_and_default'

/** The router takes a hash decoded and encodes it itself, as it hands out `route.hash`. One that does not decode stays as written. */
function decodedHash(hash: string): string {
  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

function splitUrl(url: string): { path: string; query?: Record<string, unknown>; hash?: string } {
  const hashAt = url.indexOf('#')
  // a bare `#` is no hash: it must not reach fullPath
  const hash = hashAt === -1 || hashAt === url.length - 1 ? undefined : decodedHash(url.slice(hashAt))
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

/** What a browser reads as another host: two slashes or backslashes, with the blanks it drops around them. */
const OFF_ORIGIN = /^[\0-\x20]*(?:[/\\][\t\n\r]*){2,}/

/** A redirect target stays on this origin: `//evil.example` and `/\evil.example` become `/evil.example`. */
const sameOrigin = (path: string) => path.replace(OFF_ORIGIN, '/')

/**
 * The last word on a link: only stripping a prefix or filling a catch-all param can expose a second
 * slash, so input checks are not enough. Such a link is a plain path: by name the router would build the same URL again.
 */
function onOrigin<T extends RouteLike | string>(route: T): T {
  if (typeof route === 'string') return route
  const { path, fullPath, query, hash } = route
  const url = fullPath || path || ''
  if (isPlainPath(url) || !OFF_ORIGIN.test(url)) return route
  return { path: path && sameOrigin(path), fullPath: fullPath && sameOrigin(fullPath), query, hash } as T
}

/** `/about`: a slash, then a character past those that matter (below `0`, and `\`). Spares every ordinary link the RegExp. */
function isPlainPath(url: string): boolean {
  const second = url.charCodeAt(1)
  return url.charCodeAt(0) === 47 && second >= 48 && second !== 92
}

const withoutTrailingSlash = (path: string) => (path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path)

export class I18nPathStrategy {
  protected readonly ctx: PathStrategyContext
  protected readonly codes: Set<string>
  private readonly disabledCodes: Set<string>
  private readonly prefix: string
  private readonly unknownLocale: RegExp | null
  /** Lowercased code -> code: the router matches `/:locale(de)` case-insensitively, so `/DE/about` reaches a `de` record. */
  private readonly foldedCodes: Map<string, string>
  private shared_: Shared | undefined

  constructor(ctx: PathStrategyContext) {
    this.ctx = ctx
    this.codes = new Set(ctx.locales.filter((l) => !l.disabled).map((l) => l.code))
    // build records still carry a locale disabled at runtime (runtimeConfig disabledLocales)
    this.disabledCodes = new Set(ctx.locales.filter((l) => l.disabled).map((l) => l.code))
    this.prefix = ctx.localizedRouteNamePrefix ?? 'localized-'
    // `/re/` and `re` alike, as route-strategy reads it
    this.unknownLocale = ctx.customRegexMatcher ? new RegExp(`^(?:${ctx.customRegexMatcher.replace(/^\/(.*)\/$/, '$1')})$`) : null
    this.foldedCodes = new Map(ctx.locales.map((l) => [l.code.toLowerCase(), l.code]))
  }

  setRouter(router: RouterAdapter): void {
    this.ctx.router = router
    this.shared_ = undefined
    // routes added with addRoute leave options.routes as it was: drop its tables so they are rebuilt
    const routes = (router as { options?: { routes?: unknown } }).options?.routes
    if (routes && typeof routes === 'object') TABLES.delete(routes as object)
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
    // strict / sensitive change what router.resolve answers, and the caches keep those answers
    const options = (this.ctx.router as { options?: { strict?: boolean; sensitive?: boolean } }).options
    const matching = `${options?.strict ? 1 : 0}${options?.sensitive ? 1 : 0}`
    const config = `${strategy}\0${defaultLocale}\0${[...this.codes].join(',')}\0${customRegexMatcher}\0${this.prefix}\0${matching}`
    // vue-router keeps the route array it was created with: every SSR request's router has the
    // same one, so it keys the table without walking the records (a router without it: a signature)
    // (the record count guards a router that later called addRoute on the same array). A fresh
    // array per request (router.options `routes()`) misses and falls back to a record signature.
    const all = this.ctx.router.getRoutes()
    const routes = (this.ctx.router as { options?: { routes?: unknown } }).options?.routes
    const tables = routes && typeof routes === 'object' ? tablesOf(routes as object) : null
    const tableKey = `${config}\0${all.length}`
    let shared = tables?.get(tableKey)
    if (!shared) {
      const signature = `${config}\0${signatureOf(all)}`
      shared = SIGNED.get(signature)
      if (!shared) {
        const records = all.filter((record) => !record.aliasOf && record.name !== null && record.name !== undefined)
        shared = { index: this.createIndex(records), pages: new Map(), notFound: new Map(), targets: new Map() }
        remember(SIGNED, signature, shared, SHARED_SIZE)
      }
      if (tables) remember(tables, tableKey, shared, SHARED_SIZE)
    }
    return (this.shared_ = shared)
  }

  protected createIndex(records: ReturnType<RouterAdapter['getRoutes']>): Index {
    return buildIndex(records, [...this.codes])
  }

  protected get index(): Index {
    return this.shared.index
  }

  /** Whether URLs in `locale` carry the locale segment. */
  protected hasPrefix(locale: string): boolean {
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
  protected probe(to: RouteLike | string): ResolvedRouteLike | null {
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
      const name = named(route?.name) ?? ''
      if (form === path && (unlocalized.has(name) || route?.meta?.i18nStub)) return UNLOCALIZED
      const entry = records.get(name)
      if (!entry) continue
      const { locale: urlLocale, ...params } = route!.params ?? {}
      // a custom matcher takes any segment for a locale: `/go` is a page in another form, not the home of `go`
      if (urlLocale && !this.codes.has(String(urlLocale))) continue
      const page = { base: entry.base, params, catchAll: entry.catchAll }
      if (!entry.catchAll) return page
      catchAll ??= page
    }
    const original = this.index.originals.get(withoutTrailingSlash(path))
    return original ? { base: original, params: {}, catchAll: false } : catchAll
  }

  private baseOf(name: string): string | null {
    const entry = this.index.records.get(name)
    if (entry) return entry.base
    return this.index.pages.has(name) ? name : null
  }

  /** Base name of the page a route shows, or null (unlocalized, unknown). */
  private pageBase(route: RouteLike): string | null {
    const name = named(route.name)
    if (route.name) return name && this.baseOf(name)
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
    return target && { ...target, params: copyValues(target.params), query: target.query && copyValues(target.query) }
  }

  /** A route in `locale` as an absolute URL on another domain: `DomainPathStrategy`. */
  protected external(_locale: string, _route: Target): string | null {
    return null
  }

  /** The unknown path in `locale`'s form: only the prefix changes. */
  private prefixed(locale: string, path: string): string {
    const loc = this.getLocaleFromPath(path)
    const rest = loc ? path.slice(loc.length + 1) || '/' : path || '/'
    if (!this.hasPrefix(locale)) return rest
    return rest === '/' ? `/${locale}` : `/${locale}${rest.startsWith('/') ? rest : `/${rest}`}`
  }

  switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions = {}): RouteLike | string {
    return onOrigin(this.switched(fromLocale, toLocale, route, options))
  }

  private switched(_fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string {
    // a disabled locale is no target: the link stays on the page
    if (this.disabledCodes.has(toLocale)) return route
    const name = named(route.name)
    const base = name ? this.baseOf(name) : null
    if (!base) {
      // an unlocalized page stays; an unmatched URL (a 404 page) becomes that URL in `toLocale`'s form
      // a URL no record matches: a route with a name, or matched records (an unnamed parent), stays
      const url = route.fullPath || route.path
      if (route.name || route.matched?.length || !url) return route
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

  localeRoute(locale: string, routeOrPath: RouteLike | string, _currentRoute?: ResolvedRouteLike): RouteLike {
    return onOrigin(this.localized(locale, routeOrPath))
  }

  private localized(locale: string, routeOrPath: RouteLike | string): RouteLike {
    const targetLocale = this.disabledCodes.has(locale) ? this.ctx.defaultLocale : locale
    // a string can come from a request: `//evil.example` is a path of this origin, under a catch-all too
    const input: RouteLike = typeof routeOrPath === 'string' ? splitUrl(sameOrigin(routeOrPath)) : routeOrPath
    const name = typeof routeOrPath === 'string' ? null : routeOrPath.name
    let target: Target | null = null
    if (name) {
      const key = named(name)
      const base = key && this.baseOf(key)
      if (base) target = this.routeTo(targetLocale, base, input.params ?? {}, input.query, input.hash) ?? this.home(targetLocale)
      else if (this.ctx.router.hasRoute(name)) target = this.resolve(routeOrPath)
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
    // a symbol name is never a localized page (generated records are named by strings) and has no base name
    const name = named(route.name)
    if (route.name) return name && (this.baseOf(name) ?? name)
    if (!route.path) return null
    const page = this.findPage(splitUrl(route.path).path)
    return page && page !== UNLOCALIZED ? page.base : null
  }

  /** Translation key of the route: its base name (`index` when page translations are off). */
  getPluginRouteName(route: ResolvedRouteLike, locale: string): string {
    if (this.ctx.disablePageLocales) return 'index'
    if (!route.name) return this.getRouteBaseName(route) ?? ''
    const name = named(route.name)
    if (!name) return ''
    const base = this.baseOf(name)
    if (base) return base
    // a localized name the router does not know: strip prefix and locale suffix
    const stripped = name.startsWith(this.prefix) ? name.slice(this.prefix.length) : name
    return stripped.endsWith(`-${locale}`) ? stripped.slice(0, -locale.length - 1) : stripped
  }

  getCurrentLocale(route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string {
    const { strategy, defaultLocale } = this.ctx
    if (this.ctx.hashMode) return defaultLocaleOverride || defaultLocale
    if (strategy === 'no_prefix') return this.servedLocale(route, defaultLocaleOverride || defaultLocale)
    const path = route.path || route.fullPath || ''
    const param = route.params?.locale
    const fromParams = Array.isArray(param) ? String(param[0] ?? '') : param ? String(param) : ''
    if (this.codes.has(fromParams)) return fromParams
    const folded = fromParams && this.foldedCodes.get(fromParams.toLowerCase())
    if (folded && this.codes.has(folded)) return folded
    const fromPath = this.getLocaleFromPath(path)
    if (fromPath) return fromPath
    return unprefixedIsDefault(strategy) ? defaultLocale : defaultLocaleOverride || defaultLocale
  }

  /**
   * Under no_prefix the URL names no locale, but a record can: a custom path belongs to its locales,
   * and a page restricted to some locales never renders in another one. The preference wins among them.
   */
  protected servedLocale(route: ResolvedRouteLike, preferred: string): string {
    const name = named(route.name)
    const entry = name ? this.index.records.get(name) : undefined
    if (!entry) return preferred
    const serves = name === entry.base ? this.index.pages.get(entry.base)?.has(preferred) : entry.locales.includes(preferred)
    return serves ? preferred : (entry.locales[0] ?? preferred)
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

  /** Locale a URL is in: its prefix, or the default where an unprefixed URL is its page; null under no_prefix. */
  resolveLocaleFromPath(path: string): string | null {
    if (this.ctx.strategy === 'no_prefix') return null
    return this.getLocaleFromPath(path) ?? (unprefixedIsDefault(this.ctx.strategy) ? this.ctx.defaultLocale : null)
  }

  /** Why a URL must be a 404 (a prefix that is wrong for it, an unknown locale-like segment), or null. */
  shouldReturn404(currentPath: string): string | null {
    const path = splitUrl(currentPath).path
    const cache = this.shared.notFound
    let reason = cache.get(path)
    if (reason === undefined) remember(cache, path, (reason = this.notFoundReason(path)))
    return reason
  }

  /** A first segment the router took for a locale, or a code in another case, on a URL that is no page in any form. */
  private isUnknownLocale(path: string, segment: string): boolean {
    if (this.codes.has(segment)) return false
    const custom = this.unknownLocale?.test(segment) && this.probe(path)?.params?.locale === segment
    // `%64e` is a spelling as well: the router decodes before it matches
    const code = this.foldedCodes.get((segment.includes('%') ? safeDecode(segment) : segment).toLowerCase())
    const variant = code !== undefined && code !== segment && this.ctx.strategy !== 'no_prefix'
    if (!custom && !variant) return false
    // a `/:locale` record in another spelling shows the locale's page, whatever else that URL could be (`/DE` beside `[slug]`)
    return !this.isOwnPage(path) || (variant && this.probe(path)?.params?.locale === segment)
  }

  /** The prefix of a disabled locale. A page on that segment is that page, a catch-all is not. */
  private isDisabledPrefix(path: string, segment: string): boolean {
    return this.disabledCodes.has(segment) && this.ctx.strategy !== 'no_prefix' && !this.isOwnPage(path)
  }

  /** Whether a page of its own answers the URL, in any form: no catch-all. */
  protected isOwnPage(path: string): boolean {
    const page = this.findPage(path)
    return page === UNLOCALIZED || (page !== null && !page.catchAll)
  }

  protected notFoundReason(path: string): string | null {
    const segment = path.split('/')[1] ?? ''
    if (this.isDisabledPrefix(path, segment)) return 'Locale disabled'
    if (this.isUnknownLocale(path, segment)) return 'Unknown locale'
    if (this.ctx.strategy === 'no_prefix') return null
    const locale = this.getLocaleFromPath(path)
    if (!locale) return null
    if (this.ctx.strategy === 'prefix_except_default' && locale === this.ctx.defaultLocale) return 'Default locale should not have prefix'
    const name = this.probe(path)?.name
    const key = named(name)
    const entry = key ? this.index.records.get(key) : undefined
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
    if (this.ctx.strategy === 'no_prefix' || this.disabledCodes.has(preferredLocale)) return null
    const path = splitUrl(currentPath).path || '/'
    // a runtime-disabled or unknown prefix is a 404 (`shouldReturn404`), not an unprefixed URL
    const segment = path.split('/')[1] ?? ''
    if (this.isDisabledPrefix(path, segment) || this.isUnknownLocale(path, segment)) return null
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
      // only a locale this host serves: a disabled one, or another domain's, is a 404 there
      const fallback = served.has(this.ctx.defaultLocale) ? this.ctx.defaultLocale : [...served.keys()].find((code) => this.codes.has(code))
      if (!fallback) return null
      locale = fallback
    }
    // a URL no record serves still moves to the preferred locale's form: `prefix` serves nothing
    // unprefixed, and `pages: false` / apps without an index page rely on `/` -> `/de`. Elsewhere it
    // stays the 404 it is: the prefixed form would be one too
    if (!page && this.ctx.strategy !== 'prefix' && path !== '/' && this.index.records.size > 0) return null
    const target = sameOrigin(withoutTrailingSlash((page && this.routeTo(locale, page.base, page.params)?.path) || this.prefixed(locale, path)))
    return safeDecode(target) === safeDecode(withoutTrailingSlash(path)) ? null : target
  }
}

/** A route name as an index key: generated records are named by strings; a symbol name is the app's own route. */
function named(name: unknown): string | null {
  return typeof name === 'string' && name ? name : null
}

/** One level of params / query with array values copied (repeatable params, repeated query keys). */
function copyValues(values: Record<string, unknown> | undefined): Record<string, unknown> {
  const copy: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(values ?? {})) copy[key] = Array.isArray(value) ? [...value] : value
  return copy
}

function buildIndex(records: ReturnType<RouterAdapter['getRoutes']>, codes: string[]): Index {
  const index: Index = { probeCodes: [], records: new Map(), pages: new Map(), noMeta: new Map(), unlocalized: new Set(), originals: new Map() }
  /** code -> names of the `/:locale(...)` records it is in; codes with the same list answer alike */
  const memberships = new Map<string, string[]>(codes.map((code) => [code, []]))
  const ownRecords = new Set<string>()
  for (const record of records) {
    const name = named(record.name)
    if (!name) continue
    const i18n = record.meta?.i18n as RouteI18nMeta | undefined
    if (!i18n) {
      if (!record.redirect) index.unlocalized.add(name)
      continue
    }
    const keys = Array.from(record.path.matchAll(/:(\w+)/g), (m) => m[1]!)
    index.records.set(name, { base: i18n.name, locales: i18n.locales, keys, catchAll: record.path.includes('(.*)') })
    if (keys.includes('locale')) for (const code of i18n.locales) memberships.get(code)?.push(name)
    for (const code of i18n.locales) if (record.path === `/${code}` || record.path.startsWith(`/${code}/`)) ownRecords.add(code)
    if (i18n.noMeta !== undefined) index.noMeta.set(i18n.name, i18n.noMeta)
    if (i18n.original) index.originals.set(i18n.original, i18n.name)
    let byLocale = index.pages.get(i18n.name)
    if (!byLocale) index.pages.set(i18n.name, (byLocale = new Map()))
    // prefix_and_default serves the default locale twice: links use the prefixed record
    for (const locale of i18n.locales) if (!byLocale.has(locale) || keys.includes('locale')) byLocale.set(locale, name)
  }
  // one code per group of codes in exactly the same shared records (any of them matches the same
  // records in the same order), every code with records of its own; in configured order
  const groups = new Set<string>()
  index.probeCodes = codes.filter((code) => {
    const group = memberships.get(code)!.join('\0')
    if (ownRecords.has(code) || !groups.has(group)) {
      groups.add(group)
      return true
    }
    return false
  })
  return index
}

/** Route tables seen in this process, by their route array and config (one per app; dev reloads add more). */
const TABLES = new WeakMap<object, Map<string, Shared>>()
/** Routers without `options.routes`: by a signature of their records. */
const SIGNED = new Map<string, Shared>()
// ponytail: one table per host of a domain build; more hosts than this keep rebuilding tables
const SHARED_SIZE = 64

function tablesOf(routes: object): Map<string, Shared> {
  let tables = TABLES.get(routes)
  if (!tables) TABLES.set(routes, (tables = new Map()))
  return tables
}

/** Every record, aliases included (the URL caches see them through router.resolve), and its meta.i18n. */
function signatureOf(records: ReturnType<RouterAdapter['getRoutes']>): string {
  return records
    .map((record) => `${String(record.name)}\0${record.path}\0${record.redirect ? 1 : 0}\0${JSON.stringify(record.meta?.i18n ?? null)}`)
    .join('\0')
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

const baseOf = (locale: Locale) => locale.baseUrl?.replace(/\/+$/, '')

/**
 * The strategy of a build with locale domains (`baseUrl`). On a known host (`ctx.domain`) the
 * locales of other domains are no URLs here, only link targets; on any other host the build config
 * routes and every `baseUrl` locale is a link target. A class of its own: an app without domains
 * does not ship it.
 */
export class DomainPathStrategy extends I18nPathStrategy {
  private readonly foreign: Set<string>

  constructor(ctx: PathStrategyContext) {
    const foreign = (ctx.linkLocales ?? []).filter((link) => !ctx.locales.some((locale) => locale.code === link.code))
    super({ ...ctx, locales: [...ctx.locales, ...foreign] })
    this.foreign = new Set(foreign.map((locale) => locale.code))
    for (const code of this.foreign) this.codes.delete(code)
  }

  /** Records keep every locale's prefix (other hosts link there); the default of this host links to its unprefixed record. */
  protected override createIndex(records: ReturnType<RouterAdapter['getRoutes']>): Index {
    const index = super.createIndex(records)
    const { strategy, defaultLocale, locales } = this.ctx
    const unprefixed = strategy === 'prefix_except_default' || locales.find((locale) => locale.code === defaultLocale)?.baseDefault
    if (!unprefixed || !unprefixedIsDefault(strategy)) return index
    for (const record of records) {
      const entry = index.records.get(named(record.name) ?? '')
      if (!entry?.locales.includes(defaultLocale) || entry.keys.includes('locale')) continue
      const byLocale = index.pages.get(entry.base)!
      if (index.records.get(byLocale.get(defaultLocale)!)?.keys.includes('locale')) byLocale.set(defaultLocale, record.name as string)
    }
    return index
  }

  protected override external(locale: string, route: Target): string | null {
    const config = this.ctx.locales.find((l) => l.code === locale)
    if (!config?.baseUrl || (this.ctx.domain && !this.foreign.has(locale))) return null
    const rest = this.pathOnHost(locale, config, route)
    const path = rest.startsWith('/') ? rest : `/${rest}`
    const base = baseOf(config)!
    if (this.ctx.hashMode) return `${base}/#${path}`
    // the home is the bare origin, as a host writes its own URL: one page, one form across hosts
    return path === '/' ? base : `${base}${path}`
  }

  /** The URL `route` has on the host of `locale`, which has a default of its own: that one is unprefixed there, the others are not. */
  private pathOnHost(locale: string, config: Locale, route: Target): string {
    const { fullPath, path } = route
    // under `prefix` an unprefixed URL is only a redirect
    if (config.baseDefault && this.ctx.strategy !== 'prefix')
      return this.hasPrefix(locale) && fullPath.split(/[/?#]/, 2)[1] === locale ? fullPath.slice(locale.length + 1) || '/' : fullPath
    const { strategy, defaultLocale, locales } = this.ctx
    if (strategy !== 'prefix_except_default' || locale !== defaultLocale) return fullPath
    // the build default is unprefixed only where it is the default: another locale may hold those URLs on its host
    const base = baseOf(config)
    return locales.some((other) => other.baseDefault && baseOf(other) === base)
      ? `/${locale}${path === '/' ? fullPath.slice(1) : fullPath}`
      : fullPath
  }

  protected override notFoundReason(path: string): string | null {
    const { strategy, defaultLocale } = this.ctx
    if (this.ctx.domain && !this.codes.size) return 'Locale disabled'
    if (this.foreign.has(path.split('/')[1] ?? '') && strategy !== 'no_prefix' && !this.isOwnPage(path)) return 'Locale on another domain'
    const reason = super.notFoundReason(path)
    if (reason || this.getLocaleFromPath(path)) return reason
    const entry = this.index.records.get(named(this.probe(path)?.name) ?? '')
    if (!entry?.locales.length) return null
    if (strategy === 'no_prefix') {
      if (entry.locales.some((code) => this.codes.has(code))) return null
      return entry.locales.every((code) => this.foreign.has(code)) ? 'Locale on another domain' : 'Locale disabled'
    }
    // an unprefixed record of another host's default; under prefix_except_default a page this host's default also has moves to its URL
    const movable = strategy === 'prefix_except_default' && this.index.pages.get(entry.base)?.has(defaultLocale)
    return !entry.keys.includes('locale') && !entry.locales.includes(defaultLocale) && !movable ? 'Locale not allowed for this route' : null
  }

  /** A link `localeRoute` made absolute reads as the page it shows, so it switches like any route. */
  override switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options?: SwitchLocaleOptions): RouteLike | string {
    const url = route.fullPath ?? ''
    const origin = this.originOf(url)
    const own = origin ? this.probe(url.slice(origin.length).replace(/^\/#/, '') || '/') : null
    return super.switchLocaleRoute(fromLocale, toLocale, own ?? route, options)
  }

  /** The `baseUrl` a URL lies on, the longest: one host can carry a locale at its root and another under a path. */
  private originOf(url: string): string | undefined {
    return this.ctx.locales
      .map(baseOf)
      .filter((base) => base && (url === base || url.startsWith(`${base}/`)))
      .sort((a, b) => b!.length - a!.length)[0]
  }

  /**
   * An absolute link of a locale's own domain says where it goes (`<i18n-link :to="$localeRoute(x, 'de')">`).
   * Any other absolute object stays a path: it can come from a request.
   */
  override localeRoute(locale: string, routeOrPath: RouteLike | string, currentRoute?: ResolvedRouteLike): RouteLike {
    const url = typeof routeOrPath === 'string' ? '' : routeOrPath.fullPath
    if (url && url[0] !== '/' && this.originOf(url)) return { path: url, fullPath: url }
    return super.localeRoute(locale, routeOrPath, currentRoute)
  }

  /** A page restricted to some locales renders in one this host serves. */
  protected override servedLocale(route: ResolvedRouteLike, preferred: string): string {
    const locale = super.servedLocale(route, preferred)
    if (!this.foreign.has(locale)) return locale
    return this.index.records.get(named(route.name) ?? '')?.locales.find((code) => !this.foreign.has(code)) ?? preferred
  }

  override getClientRedirect(currentPath: string, preferredLocale: string, options?: ClientRedirectOptions): string | null {
    const foreign = this.foreign.has(preferredLocale) || this.foreign.has(splitUrl(currentPath).path.split('/')[1] ?? '')
    return foreign ? null : super.getClientRedirect(currentPath, preferredLocale, options)
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
