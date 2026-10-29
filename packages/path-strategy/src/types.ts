import type { I18nRouteParams, Locale, Strategies } from '@i18n-micro/types'

/** Route-like shape (compatible with vue-router). */
export interface RouteLike {
  /** vue-router names may be symbols (`RouteRecordNameGeneric`). */
  name?: string | symbol | null
  path?: string
  params?: Record<string, unknown>
  query?: Record<string, unknown>
  hash?: string
  fullPath?: string
  /** Route meta (vue-router merges the matched records'): `i18nNoMeta` marks an unlocalized page's disableMeta. */
  meta?: Record<string, unknown>
}

/** Resolved route (path and fullPath required). */
export interface ResolvedRouteLike extends RouteLike {
  name: string | symbol | null | undefined
  path: string
  fullPath: string
  /** Matched records (vue-router routes have them): an unnamed route that matched is not a 404. */
  matched?: unknown[]
}

/** What path-strategy reads from a vue-router record (`router.getRoutes()`). */
export interface RouteRecordLike {
  name?: string | symbol | null
  path: string
  meta?: Record<string, unknown>
  redirect?: unknown
  aliasOf?: unknown
}

/** `meta.i18n` that route-strategy puts on every localized record. */
export interface RouteI18nMeta {
  /** Base route name of the page. */
  name: string
  /** Locales the record serves. */
  locales: string[]
  /** `disableMeta` of the page: SEO tags off in every locale (`true`) or in the listed ones. */
  noMeta?: boolean | string[]
}

export interface RouterAdapter {
  hasRoute: (name: string) => boolean
  // biome-ignore lint: vue-router's `resolve` takes its own location type
  resolve: (to: any) => ResolvedRouteLike
  getRoutes: () => RouteRecordLike[]
}

export interface PathStrategyContext {
  strategy: Strategies
  defaultLocale: string
  locales: Locale[]
  localizedRouteNamePrefix?: string
  router: RouterAdapter
  /** Hash mode: the locale is not read from the URL. */
  hashMode?: boolean
  /** All pages use the global translations only. */
  disablePageLocales?: boolean
  /** Pattern of locale-like first segments (`customRegexMatcher`): one that is no known locale is a 404. */
  customRegexMatcher?: string
}

export interface ClientRedirectOptions {
  /**
   * `autoDetectPath: '*'`: a URL already in another locale moves to the preferred one too
   * (the same page in that locale), not only unprefixed URLs.
   */
  switchPrefixed?: boolean
}

export interface SwitchLocaleOptions {
  i18nRouteParams?: I18nRouteParams
}
