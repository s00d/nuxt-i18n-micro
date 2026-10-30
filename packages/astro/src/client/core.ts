import { defaultPlural, interpolate, resolveTranslation } from '@i18n-micro/core'
import type { Getter, Params, TranslationKey, Translations } from '@i18n-micro/types'

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
 * Pure function to get a translation from state
 *
 * Note: This is a simplified version optimized for client-side islands.
 * It supports basic translation lookup and interpolation.
 * Returns CleanTranslation which can be string, number, boolean, object, or null.
 * For advanced features like Linked Messages (@:path.to.key), use the server-side i18n instance.
 */
export function translate(
  state: I18nState,
  key: string,
  params?: Params,
  defaultValue?: string | null,
  routeName?: string,
): string | number | boolean | Translations | null {
  if (!key) {
    return defaultValue || key || ''
  }

  // If not found, use defaultValue or key
  const value = lookup(state, key, routeName) || (defaultValue === undefined ? key : defaultValue || key)

  if (typeof value === 'string' && params) {
    return interpolate(value, params)
  }
  return value
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
 * Checks if a translation exists in the state
 */
export function hasTranslation(state: I18nState, key: string, routeName?: string): boolean {
  const value = lookup(state, key, routeName)
  return value !== null && typeof value !== 'object'
}
