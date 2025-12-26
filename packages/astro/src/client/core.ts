import type { Translations, Params } from '@i18n-micro/types'
import { interpolate } from '@i18n-micro/core'

/**
 * Состояние i18n для клиентских островов
 */
export interface I18nState {
  locale: string
  fallbackLocale: string
  translations: Record<string, Translations> // routeName -> translations
  currentRoute: string
}

// Вспомогательная функция для поиска перевода в объекте Translations
// Returns the value as-is, including objects (for nested translations)
function findTranslation<T = unknown>(translations: Translations | null, key: string): T | null {
  if (translations === null || typeof key !== 'string') {
    return null
  }

  let value: string | number | boolean | Translations | unknown | null = translations

  // Прямой доступ к ключу
  if (translations[key]) {
    value = translations[key]
  }
  else {
    // Поиск по вложенным ключам (например, "nested.message")
    const parts = key.toString().split('.')
    for (const part of parts) {
      if (value && typeof value === 'object' && value !== null && part in value) {
        value = (value as Translations)[part]
      }
      else {
        return null
      }
    }
  }

  // Return value as-is (can be string, number, boolean, object, or null)
  // This matches CleanTranslation type which allows objects
  return (value as T) ?? null
}

/**
 * Чистая функция для получения перевода из состояния
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

  // 1. Ищем в route-specific переводах
  if (state.translations[route]) {
    value = findTranslation<string | number | boolean | Translations>(state.translations[route], key)
  }

  // 2. Fallback на general переводы
  if (!value && state.translations.general) {
    value = findTranslation<string | number | boolean | Translations>(state.translations.general, key)
  }

  // 3. Если не найдено, используем defaultValue или key
  if (!value) {
    value = defaultValue === undefined ? key : (defaultValue || key)
  }

  // 4. Интерполяция параметров (только для строк)
  if (typeof value === 'string' && params) {
    return interpolate(value, params)
  }

  // 5. Возвращаем value как есть (может быть string, number, boolean, object, или null)
  // Это соответствует типу CleanTranslation
  return value
}

/**
 * Проверяет наличие перевода в состоянии
 */
export function hasTranslation(
  state: I18nState,
  key: string,
  routeName?: string,
): boolean {
  const route = routeName || state.currentRoute
  const routeTranslations = state.translations[route]
  const generalTranslations = state.translations.general

  // Проверяем в route-specific переводах
  if (routeTranslations) {
    const value = findTranslation(routeTranslations, key)
    if (value !== null && typeof value !== 'object') {
      return true
    }
  }

  // Проверяем в general переводах
  if (generalTranslations) {
    const value = findTranslation(generalTranslations, key)
    if (value !== null && typeof value !== 'object') {
      return true
    }
  }

  return false
}
