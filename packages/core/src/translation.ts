import type { Translations } from '@i18n-micro/types'

/**
 * Bare Metal: Простое хранилище переводов без Ref, useState, devalue.
 * Ключ Map: locale (general) или locale:routeName (page-specific).
 */
export interface TranslationStorage {
  translations: Map<string, Translations>
}

function findValue<T = unknown>(data: Translations | null | undefined, key: string): T | null {
  if (!data || typeof key !== 'string') return null

  if (key in data) {
    const value = data[key]
    if (typeof value === 'object' && value !== null) {
      return value as T
    }
    return value as T
  }

  const parts = key.split('.')
  let value: unknown = data
  for (const part of parts) {
    if (value && typeof value === 'object' && part in (value as object)) {
      value = (value as Translations)[part]
    }
    else {
      return null
    }
  }
  return (value as T) ?? null
}

export function useTranslationHelper(storage?: TranslationStorage) {
  const translations = storage?.translations ?? new Map<string, Translations>()

  return {
    hasCache(locale: string, page: string) {
      const cacheKey = `${locale}:${page}`
      return translations.has(cacheKey) || translations.has(locale)
    },
    getCache(locale: string, routeName: string) {
      const cacheKey = `${locale}:${routeName}`
      return translations.get(cacheKey)
    },
    setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>) {
      // No-op for bare metal
    },
    hasTranslation(locale: string, key: string): boolean {
      for (const [k, v] of translations) {
        if ((k === locale || k.startsWith(`${locale}:`)) && findValue(v, key) !== null) {
          return true
        }
      }
      return false
    },
    hasGeneralTranslation(locale: string): boolean {
      return translations.has(locale)
    },
    hasPageTranslation(locale: string, routeName: string): boolean {
      return translations.has(`${locale}:${routeName}`)
    },
    getTranslation<T = unknown>(locale: string, routeName: string, key: string): T | null {
      const routeKey = `${locale}:${routeName}`
      const routeData = translations.get(routeKey)
      const val = findValue<T>(routeData, key)
      if (val !== null) return val

      const generalData = translations.get(locale)
      return findValue<T>(generalData, key)
    },
    loadTranslations(locale: string, data: Translations): void {
      // Merge with existing, replacing duplicate keys
      const existing = translations.get(locale) ?? {}
      translations.set(locale, { ...existing, ...data })
    },
    setTranslations(locale: string, data: Translations): void {
      // Replace all translations for locale (no merge)
      translations.set(locale, data)
    },
    loadPageTranslations(locale: string, routeName: string, data: Translations): void {
      const key = `${locale}:${routeName}`
      const existing = translations.get(key)
      // Perf: при пустом existing — сохраняем ссылку, избегаем O(n) копирования больших объектов
      if (!existing || Object.keys(existing).length === 0) {
        translations.set(key, data)
      }
      else {
        translations.set(key, { ...existing, ...data })
      }
    },
    mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force = false): void {
      const key = `${locale}:${routeName}`
      const existing = translations.get(key) ?? {}
      translations.set(key, { ...existing, ...newTranslations })
    },
    mergeGlobalTranslation(locale: string, newTranslations: Translations, _force = false): void {
      const existing = translations.get(locale) ?? {}
      translations.set(locale, { ...existing, ...newTranslations })
    },
    clearCache(): void {
      translations.clear()
    },
  }
}
