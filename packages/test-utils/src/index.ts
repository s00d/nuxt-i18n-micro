import { interpolate, mergeTranslationLayers, setTranslationAtKey, useTranslationHelper } from '@i18n-micro/core'
import type { MissingHandler, Params, Translation, TranslationKey, Translations } from '@i18n-micro/types'

type LocaleCode = string

export interface Locale {
  code: LocaleCode
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  displayName?: string
  baseUrl?: string
  baseDefault?: boolean
}

export type Getter = (key: TranslationKey, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown

export type SpyFn = <T>(fn: T) => T

export interface ResetI18nOptions {
  locale?: string
  defaultLocale?: string | undefined
  localeName?: string | null
  locales?: Locale[]
  routeName?: string
}

export interface CreateFakeI18nOptions {
  /** Wrap each method (e.g. `vi.fn`). Defaults to identity — no Vitest dependency. */
  spy?: SpyFn
}

const plural = (key: TranslationKey, count: number, params: Params, _locale: string, getter: Getter) => {
  const translation = getter(key, params)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  const formIndex = count < forms.length ? count : forms.length > 0 ? forms.length - 1 : 0
  const form = forms[formIndex]
  if (!form) {
    return null
  }
  return form.trim().replace('{count}', count.toString())
}

const i18nHelper = useTranslationHelper()
const DEFAULT_LOCALES: Locale[] = [{ code: 'en' }]

let locales: Locale[] = [...DEFAULT_LOCALES]
let locale = 'en'
let defLocale: string | undefined = 'en'
let localeName: string | null = 'English'
let routeName = 'test'
/** Path without locale prefix, used by switchLocalePath / switchLocaleRoute. */
let pagePath = '/'
let missingHandler: MissingHandler | null = null
let i18nRouteParams: unknown = {}

function formatNumber(value: number, loc: string, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(loc, options).format(value)
}

function formatDate(value: Date | number | string, loc: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(loc, options).format(new Date(value))
}

function routeNameFromUnknown(route: unknown): string {
  if (route === null || route === undefined) return routeName
  if (typeof route === 'string') return route
  if (typeof route === 'object' && 'name' in route) {
    const name = (route as { name?: string | symbol | null }).name
    if (name !== null && name !== undefined) return String(name)
  }
  return routeName
}

function normalizePathInput(to: unknown): string {
  if (typeof to === 'string') {
    const bare = to.split('?')[0]?.split('#')[0] ?? '/'
    if (!bare || bare === '/') return '/'
    return bare.startsWith('/') ? bare : `/${bare}`
  }
  if (to && typeof to === 'object') {
    const obj = to as { path?: string; name?: string | symbol | null }
    if (typeof obj.path === 'string' && obj.path.length > 0) {
      return obj.path.startsWith('/') ? obj.path : `/${obj.path}`
    }
    if (obj.name !== null && obj.name !== undefined) {
      const name = String(obj.name)
      return name.startsWith('/') ? name : `/${name}`
    }
  }
  return '/'
}

function joinLocalePath(code: string, path: string): string {
  if (!path || path === '/') return `/${code}`
  return `/${code}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Reset module-level mock state and clear the translation cache.
 * Call from `beforeEach` so tests do not leak dictionaries/locales.
 */
export function resetI18n(options: ResetI18nOptions = {}): void {
  i18nHelper.clearCache()
  locale = options.locale ?? 'en'
  defLocale = options.defaultLocale !== undefined ? options.defaultLocale : 'en'
  localeName = options.localeName !== undefined ? options.localeName : 'English'
  locales = options.locales ? [...options.locales] : [...DEFAULT_LOCALES]
  routeName = options.routeName ?? 'test'
  pagePath = '/'
  missingHandler = null
  i18nRouteParams = {}
}

export function t(key: TranslationKey, params?: Params, defaultValue?: string | null): Translation {
  let value = i18nHelper.getTranslation(locale, routeName, key)
  if (value === null && defLocale && locale !== defLocale) {
    value = i18nHelper.getTranslation(defLocale, routeName, key)
  }

  if (value === null || value === undefined) {
    missingHandler?.(locale, key, routeName)
    console.warn(`Missing translation key: ${key}`)
    return (defaultValue ?? key) as Translation
  }

  return typeof value === 'string' && params ? interpolate(value, params) : value
}

export function tc(key: TranslationKey, params: number | Params, defaultValue?: string): string {
  const { count, ...otherParams } = typeof params === 'number' ? { count: params } : params
  const countValue = count ?? 0

  return plural(key, Number.parseInt(countValue.toString(), 10), otherParams, locale, t) ?? defaultValue ?? key
}

export async function setTranslationsFromJson(loc: string, translations: Record<string, unknown>) {
  i18nHelper.setTranslations(loc, { ...translations } as Translations, routeName)
}

export const getLocale = (_route?: unknown) => locale
export const setLocale = (val: string) => {
  locale = val
}

export const getLocaleName = () => localeName
export const setLocaleName = (val: string | null) => {
  localeName = val
}

export const getLocales = () => locales
export const setLocales = (val: Locale[]) => {
  locales = val
}

export const defaultLocale = () => defLocale
export const setDefaultLocale = (val: string | undefined) => {
  defLocale = val
}

export const getRouteName = (_route?: unknown, _locale?: string) => routeName
/** @deprecated Typo kept for compatibility — prefer `setRouteName`. */
export const settRouteName = (val: string) => {
  routeName = val
}
export const setRouteName = settRouteName

export const ts = (key: TranslationKey, params?: Params, defaultValue?: string | null) => {
  const value = t(key, params, defaultValue)
  return value?.toString() ?? defaultValue ?? key
}

/** Bind `$t` to translations for a specific route name (Nuxt `$_t` mock). */
export function _t(route: unknown) {
  const boundRoute = routeNameFromUnknown(route)
  return (key: TranslationKey, params?: Params, defaultValue?: string | null): Translation => {
    const previous = routeName
    routeName = boundRoute
    try {
      return t(key, params, defaultValue)
    } finally {
      routeName = previous
    }
  }
}

/** Bind `$ts` to translations for a specific route name (Nuxt `$_ts` mock). */
export function _ts(route: unknown) {
  const bound = _t(route)
  return (key: TranslationKey, params?: Params, defaultValue?: string | null): string => {
    const value = bound(key, params, defaultValue)
    return value?.toString() ?? defaultValue ?? key
  }
}

export const tn = (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, locale, options)

export const td = (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => formatDate(value, locale, options)

export function tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string {
  const date = new Date(value)
  const diffMs = date.getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
    ['second', 1000],
  ]
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === 'second') {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...options }).format(Math.round(diffMs / ms), unit)
    }
  }
  return ''
}

export const has = (key: TranslationKey): boolean => i18nHelper.hasTranslation(locale, key)

export const mergeTranslations = (newTranslations: Translations): void => {
  i18nHelper.mergeTranslation(locale, routeName, newTranslations, true)
}

export const resolveTranslations = (): Record<string, unknown> => {
  const active = (i18nHelper.getCache(locale, routeName) ?? {}) as Record<string, unknown>
  const fallback = defLocale
  if (!fallback || locale === fallback) return active

  const fb = (i18nHelper.getCache(fallback, routeName) ?? {}) as Record<string, unknown>
  return mergeTranslationLayers(fb, active)
}

export const setTranslation = (key: TranslationKey, value: unknown): void => {
  const current = (i18nHelper.getCache(locale, routeName) ?? {}) as Record<string, unknown>
  i18nHelper.setTranslations(locale, setTranslationAtKey(current, String(key), value), routeName)
}

export async function loadPageTranslations(loc: string, page: string, translations: Translations): Promise<void> {
  i18nHelper.loadPageTranslations(loc, page, translations)
}

export function setMissingHandler(handler: MissingHandler | null): void {
  missingHandler = handler
}

export function getI18nConfig() {
  return {
    locales,
    defaultLocale: defLocale,
    strategy: 'prefix' as const,
  }
}

/** Minimal strategy stub so `useI18n().$i18nStrategy` does not throw. */
export const i18nStrategy = {
  localizePath(path: string, loc: string = locale) {
    return joinLocalePath(loc, normalizePathInput(path))
  },
}

export function localePath(to: unknown, loc?: string): string {
  const code = loc ?? locale
  const path = normalizePathInput(to)
  pagePath = path
  return joinLocalePath(code, path)
}

export function switchLocalePath(loc: string): string {
  locale = loc
  return joinLocalePath(loc, pagePath)
}

export function localeRoute(to: unknown, loc?: string) {
  const path = localePath(to, loc)
  const name = to && typeof to === 'object' && 'name' in to ? (to as { name?: string | symbol | null }).name : undefined
  return { path, ...(name !== null && name !== undefined ? { name } : {}) }
}

export function switchLocaleRoute(loc: string) {
  locale = loc
  return { path: joinLocalePath(loc, pagePath), name: routeName }
}

export function switchLocale(val: string): void {
  locale = val
}

export function switchRoute(route: unknown, toLocale?: string): void {
  if (toLocale) locale = toLocale
  pagePath = normalizePathInput(route)
}

export function setI18nRouteParams(value: unknown) {
  i18nRouteParams = value
  return value
}

const identitySpy: SpyFn = <T>(fn: T) => fn

/**
 * Build a `useI18n()`-shaped mock for `mockNuxtImport('useI18n', …)`.
 * Includes `$…` methods, bare aliases (`t` / `$t`), and test setters (`setLocale`, …).
 */
export function createFakeI18n(options: CreateFakeI18nOptions = {}) {
  const spy = options.spy ?? identitySpy

  const injections = {
    $i18nStrategy: i18nStrategy,
    $getI18nConfig: spy(getI18nConfig),
    $getLocale: spy(getLocale),
    $setLocale: spy(setLocale),
    $getLocaleName: spy(getLocaleName),
    $setLocaleName: spy(setLocaleName),
    $getLocales: spy(getLocales),
    $setLocales: spy(setLocales),
    $defaultLocale: spy(defaultLocale),
    $setDefaultLocale: spy(setDefaultLocale),
    $getRouteName: spy(getRouteName),
    $settRouteName: spy(settRouteName),
    $setRouteName: spy(setRouteName),
    $t: spy(t),
    $_t: spy(_t),
    $ts: spy(ts),
    $_ts: spy(_ts),
    $tc: spy(tc),
    $tn: spy(tn),
    $td: spy(td),
    $tdr: spy(tdr),
    $has: spy(has),
    $resolveTranslations: spy(resolveTranslations),
    $setTranslation: spy(setTranslation),
    $mergeTranslations: spy(mergeTranslations),
    $switchLocaleRoute: spy(switchLocaleRoute),
    $switchLocalePath: spy(switchLocalePath),
    $switchLocale: spy(switchLocale),
    $switchRoute: spy(switchRoute),
    $localeRoute: spy(localeRoute),
    $localePath: spy(localePath),
    $setI18nRouteParams: spy(setI18nRouteParams),
    $loadPageTranslations: spy(loadPageTranslations),
    $setMissingHandler: spy(setMissingHandler),
    $setTranslationsFromJson: spy(setTranslationsFromJson),
  } as const

  const bare = Object.fromEntries(Object.entries(injections).map(([key, value]) => [key.startsWith('$') ? key.slice(1) : key, value]))

  return {
    ...injections,
    ...bare,
  }
}

export const i18nUtils = {
  t,
  tc,
  ts,
  tn,
  td,
  tdr,
  has,
  resetI18n,
  createFakeI18n,
  setTranslationsFromJson,
  loadPageTranslations,
  setMissingHandler,
  getI18nConfig,
  i18nStrategy,
  getLocale,
  setLocale,
  getLocaleName,
  setLocaleName,
  getLocales,
  setLocales,
  defaultLocale,
  setDefaultLocale,
  getRouteName,
  settRouteName,
  setRouteName,
  _t,
  _ts,
  mergeTranslations,
  resolveTranslations,
  setTranslation,
  switchLocaleRoute,
  switchLocalePath,
  switchLocale,
  switchRoute,
  localeRoute,
  localePath,
  setI18nRouteParams,
}
