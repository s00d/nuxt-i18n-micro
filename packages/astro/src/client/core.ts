import { defaultPlural, FormatService, interpolate, resolveTranslation } from '@i18n-micro/core'
import type { CleanTranslation, Getter, Params, TranslationKey, Translations } from '@i18n-micro/types'

/**
 * I18n state for client islands
 */
export interface I18nState {
  locale: string
  fallbackLocale: string
  translations: Record<string, Translations> // routeName -> translations
  currentRoute: string
}

type Value = string | number | boolean | Translations

/**
 * The value at `key` in the route's dictionary, or null. Own keys only (core's `resolveTranslation`):
 * `toString` or `__proto__` is a missing key, not `Object.prototype`'s.
 */
function lookup(state: I18nState, key: string, routeName?: string): Value | null {
  const route = routeName || state.currentRoute
  const translations = Object.prototype.hasOwnProperty.call(state.translations, route) ? state.translations[route] : undefined
  return (resolveTranslation(translations, key) as Value | null) ?? null
}

/**
 * Pure function to get a translation from state, answering as the server's `t()` does over the
 * same keys. `getI18nProps` already merged the root and fallback dictionaries into the state.
 * For Linked Messages (@:path.to.key), use the server-side i18n instance.
 */
export function translate(
  state: I18nState,
  key: string,
  params?: Params,
  defaultValue?: string | null,
  routeName?: string,
): string | number | boolean | Translations | null {
  if (!key) return ''
  // `??`: 0, false and '' are values, as on the server
  const value = lookup(state, key, routeName) ?? (defaultValue || key)
  return typeof value === 'string' && params ? interpolate(value, params) : value
}

/**
 * `tc` of every island adapter, as the server's `BaseI18n.tc`: a missing key gives `defaultValue`
 * (else the key), because the getter reports the miss to `defaultPlural` instead of the key.
 */
export function translatePlural(state: I18nState, key: TranslationKey, count: number | Params, defaultValue?: string): string {
  const { count: countValue, ...params } = typeof count === 'number' ? { count } : count
  if (countValue === undefined || countValue === null) return defaultValue ?? key
  const getter: Getter = (k, p, dv) => {
    const raw = lookup(state, k)
    if (raw === null) return dv === undefined ? undefined : dv || k
    return p && typeof raw === 'string' ? interpolate(raw, p) : raw
  }
  return defaultPlural(key, Number(countValue), params, state.locale, getter) ?? defaultValue ?? key
}

/**
 * Checks if a translation exists in the state: a subtree counts, as on the server
 */
export function hasTranslation(state: I18nState, key: string, routeName?: string): boolean {
  return lookup(state, key, routeName) !== null
}

const formatter = /*#__PURE__*/ new FormatService()

/** What every island adapter returns, over the state it reads at each call. */
export function createIslandApi(getState: () => I18nState) {
  const t = (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation =>
    translate(getState(), key as string, params, defaultValue, routeName)

  return {
    t,
    ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string =>
      t(key, params, defaultValue, routeName)?.toString() ?? defaultValue ?? (key as string),
    tc: (key: TranslationKey, count: number | Params, defaultValue?: string): string => translatePlural(getState(), key, count, defaultValue),
    tn: (value: number, options?: Intl.NumberFormatOptions): string => formatter.formatNumber(value, getState().locale, options),
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string => formatter.formatDate(value, getState().locale, options),
    tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string =>
      formatter.formatRelativeTime(value, getState().locale, options),
    has: (key: TranslationKey, routeName?: string): boolean => hasTranslation(getState(), key as string, routeName),
    getRoute: (): string => getState().currentRoute,
  }
}
