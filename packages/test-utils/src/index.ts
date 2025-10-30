import type { Params, Translation, Translations } from 'nuxt-i18n-micro-types'
import { useTranslationHelper, interpolate } from 'nuxt-i18n-micro-core'

type LocaleCode = string

interface Locale {
  code: LocaleCode
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  displayName?: string
  baseUrl?: string
  baseDefault?: boolean
}

export type Getter = (key: string, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown

const plural = (key: string, count: number, params: Params, _locale: string, getter: Getter) => {
  const translation = getter(key, params)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  return (count < forms.length ? forms[count].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
}

const i18nHelper = useTranslationHelper()
let locales: Locale[] = [
  {
    code: 'en',
  },
]
let locale = 'en'
let defLocale: string | undefined = 'en'
let localeName: string | null = 'English'
let routeName: string = 'test'

function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

function formatDate(value: Date | number | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

// Example utilities for testing
export function t(key: string, params?: Params, defaultValue?: string): Translation {
  const value = i18nHelper.getTranslation(locale, routeName, key)

  if (!value) {
    console.warn(`Missing translation key: ${key}`)
    return defaultValue || key
  }

  return typeof value === 'string' && params ? interpolate(value, params) : value
}

export function tc(key: string, params: number | Params, defaultValue?: string): string {
  const { count, ...otherParams } = typeof params === 'number' ? { count: params } : params

  return plural(key, Number.parseInt(count.toString()), otherParams, locale, t) ?? defaultValue ?? key
}

export async function setTranslationsFromJson(locale: string, translations: Record<string, unknown>) {
  await i18nHelper.loadTranslations(locale, translations)
}

export const getLocale = () => locale
export const setLocale = (val: string) => locale = val

export const getLocaleName = () => localeName
export const setLocaleName = (val: string | null) => localeName = val

export const getLocales = () => locales
export const setLocales = (val: Locale[]) => locales = val

export const defaultLocale = () => defLocale
export const setDefaultLocale = (val: string | undefined) => defLocale = val

export const getRouteName = (_route?: unknown, _locale?: string) => routeName
export const settRouteName = (val: string) => routeName = val

export const ts = (key: string, params?: Params, defaultValue?: string) => {
  const value = t(key, params, defaultValue)
  return value?.toString() ?? defaultValue ?? key
}

export const tn = (value: number, options?: Intl.NumberFormatOptions) =>
  formatNumber(value, locale, options)

export const td = (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
  formatDate(value, locale, options)

export const has = (key: string): boolean => i18nHelper.hasTranslation(locale, key)

export const mergeTranslations = (newTranslations: Translations): void =>
  i18nHelper.mergeTranslation(locale, routeName, newTranslations, true)

export const switchLocaleRoute = (val: string) => locale = val

export const switchLocalePath = (val: string) => locale = val

export const switchLocale = (val: string) => locale = val

export const switchRoute = (_route: unknown, _toLocale?: string): void => {}

export const localeRoute = (_to: unknown, _locale?: string) => {}

export const localePath = (_to: unknown, _locale?: string): string => ''

export const setI18nRouteParams = (_value: unknown) => {}

// Export utilities for use in tests
export const i18nUtils = {
  t,
  tc,
  setTranslationsFromJson,

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
  ts,
  tn,
  td,
  has,
  mergeTranslations,
  switchLocaleRoute,
  switchLocalePath,
  switchLocale,
  switchRoute,
  localeRoute,
  localePath,
  setI18nRouteParams,
}
