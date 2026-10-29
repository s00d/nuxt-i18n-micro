import type { I18nRouteParams, Locale, Strategies } from '@i18n-micro/types'

/** Route-like shape (compatible with vue-router). */
export interface RouteLike {
  name?: string | null
  path?: string
  params?: Record<string, unknown>
  query?: Record<string, unknown>
  hash?: string
  fullPath?: string
}

/** Resolved route (path and fullPath required). */
export interface ResolvedRouteLike extends RouteLike {
  name: string | null
  path: string
  fullPath: string
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
}

export interface RouterAdapter {
  hasRoute: (name: string) => boolean
  resolve: (to: RouteLike | string) => ResolvedRouteLike
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
}

export interface SwitchLocaleOptions {
  i18nRouteParams?: I18nRouteParams
}
