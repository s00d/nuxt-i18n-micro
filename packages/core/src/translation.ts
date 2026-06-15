import type { Translations } from '@i18n-micro/types'
import { getByPath, resolveTranslation, translationCacheKey } from './helpers'

/**
 * Bare Metal: Simple translation storage without Ref, useState, devalue.
 * Map key: `${locale}:${routeName}` (page-specific).
 */
export interface TranslationStorage {
  translations: Map<string, Translations>
}

export function useTranslationHelper(storage?: TranslationStorage) {
  const translations = storage?.translations ?? new Map<string, Translations>()

  return {
    hasCache(locale: string, page: string) {
      return translations.has(translationCacheKey(locale, page))
    },
    getCache(locale: string, routeName: string) {
      return translations.get(translationCacheKey(locale, routeName))
    },
    setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>) {
      // No-op for bare metal
    },
    hasTranslation(locale: string, key: string): boolean {
      for (const [k, v] of translations) {
        if (k.startsWith(`${locale}:`) && getByPath(v as Record<string, unknown>, key) !== undefined) {
          return true
        }
      }
      return false
    },
    hasPageTranslation(locale: string, routeName: string): boolean {
      return translations.has(translationCacheKey(locale, routeName))
    },
    getTranslation<T = unknown>(locale: string, routeName: string, key: string): T | null {
      const data = translations.get(translationCacheKey(locale, routeName))
      if (!data) return null
      return resolveTranslation(data as Record<string, unknown>, key) as T | null
    },
    loadTranslations(locale: string, data: Translations, routeName = 'index'): void {
      const key = translationCacheKey(locale, routeName)
      const existing = translations.get(key)
      if (existing) {
        Object.assign(existing, data)
      } else {
        translations.set(key, { ...data })
      }
    },
    setTranslations(locale: string, data: Translations, routeName = 'index'): void {
      translations.set(translationCacheKey(locale, routeName), data)
    },
    loadPageTranslations(locale: string, routeName: string, data: Translations): void {
      const key = translationCacheKey(locale, routeName)
      const existing = translations.get(key)
      if (!existing || Object.keys(existing).length === 0) {
        translations.set(key, { ...data })
      } else {
        Object.assign(existing, data)
      }
    },
    mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force = false): void {
      const key = translationCacheKey(locale, routeName)
      const existing = translations.get(key)
      if (existing) {
        Object.assign(existing, newTranslations)
      } else {
        translations.set(key, { ...newTranslations })
      }
    },
    clearCache(): void {
      translations.clear()
    },
  }
}
