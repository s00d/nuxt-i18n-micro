import { interpolate } from '@i18n-micro/core'
import type { Params, Translations } from '@i18n-micro/types'

/**
 * I18n state for client islands
 */
export interface I18nState {
  locale: string
  fallbackLocale: string
  translations: Record<string, Translations> // routeName -> translations
  currentRoute: string
}

// Helper function to find a translation in a Translations object
// Returns the value as-is, including objects (for nested translations)
function findTranslation<T = unknown>(translations: Translations | null, key: string): T | null {
  if (translations === null || typeof key !== 'string') {
    return null
  }

  let value: string | number | boolean | Translations | unknown | null = translations

  // Direct key access
  if (translations[key]) {
    value = translations[key]
  } else {
    // Search by nested keys (e.g. "nested.message")
    const parts = key.toString().split('.')
    for (const part of parts) {
      if (value && typeof value === 'object' && value !== null && part in value) {
        value = (value as Translations)[part]
      } else {
        return null
      }
    }
  }

  // Return value as-is (can be string, number, boolean, object, or null)
  // This matches CleanTranslation type which allows objects
  return (value as T) ?? null
}

/**
 * Pure function to get a translation from state
 *
 * Note: This is a simplified version optimized for client-side islands.
 * It supports basic translation lookup, interpolation, and fallback to general translations.
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

  const route = routeName || state.currentRoute
  let value: string | number | boolean | Translations | null = null

  // 1. Look in route-specific translations
  if (state.translations[route]) {
    value = findTranslation<string | number | boolean | Translations>(state.translations[route], key)
  }

  // 2. Fallback to general translations
  if (!value && state.translations.general) {
    value = findTranslation<string | number | boolean | Translations>(state.translations.general, key)
  }

  // 3. If not found, use defaultValue or key
  if (!value) {
    value = defaultValue === undefined ? key : defaultValue || key
  }

  // 4. Parameter interpolation (strings only)
  if (typeof value === 'string' && params) {
    return interpolate(value, params)
  }

  // 5. Return value as-is (can be string, number, boolean, object, or null)
  // This matches the CleanTranslation type
  return value
}

/**
 * Checks if a translation exists in the state
 */
export function hasTranslation(state: I18nState, key: string, routeName?: string): boolean {
  const route = routeName || state.currentRoute
  const routeTranslations = state.translations[route]
  const generalTranslations = state.translations.general

  // Check in route-specific translations
  if (routeTranslations) {
    const value = findTranslation(routeTranslations, key)
    if (value !== null && typeof value !== 'object') {
      return true
    }
  }

  // Check in general translations
  if (generalTranslations) {
    const value = findTranslation(generalTranslations, key)
    if (value !== null && typeof value !== 'object') {
      return true
    }
  }

  return false
}
