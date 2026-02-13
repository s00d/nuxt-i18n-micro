import type { Translations } from '@i18n-micro/types'

/**
 * Bare Metal: Simple translation storage without Ref, useState, devalue.
 * Map key: `${locale}:${routeName}` (page-specific).
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
    } else {
      return null
    }
  }
  return (value as T) ?? null
}

export function useTranslationHelper(storage?: TranslationStorage) {
  const translations = storage?.translations ?? new Map<string, Translations>()

  return {
    hasCache(locale: string, page: string) {
      const p = page || 'index'
      return translations.has(`${locale}:${p}`)
    },
    getCache(locale: string, routeName: string) {
      const rn = routeName || 'index'
      return translations.get(`${locale}:${rn}`)
    },
    setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>) {
      // No-op for bare metal
    },
    hasTranslation(locale: string, key: string): boolean {
      for (const [k, v] of translations) {
        if (k.startsWith(`${locale}:`) && findValue(v, key) !== null) {
          return true
        }
      }
      return false
    },
    hasPageTranslation(locale: string, routeName: string): boolean {
      const rn = routeName || 'index'
      return translations.has(`${locale}:${rn}`)
    },
    getTranslation<T = unknown>(locale: string, routeName: string, key: string): T | null {
      const rn = routeName || 'index'
      return findValue<T>(translations.get(`${locale}:${rn}`), key)
    },
    loadTranslations(locale: string, data: Translations, routeName = 'index'): void {
      const rn = routeName || 'index'
      const key = `${locale}:${rn}`
      const existing = translations.get(key) ?? {}
      translations.set(key, { ...existing, ...data })
    },
    setTranslations(locale: string, data: Translations, routeName = 'index'): void {
      const rn = routeName || 'index'
      translations.set(`${locale}:${rn}`, data)
    },
    loadPageTranslations(locale: string, routeName: string, data: Translations): void {
      const rn = routeName || 'index'
      const key = `${locale}:${rn}`
      const existing = translations.get(key)
      if (!existing || Object.keys(existing).length === 0) {
        translations.set(key, data)
      } else {
        translations.set(key, { ...existing, ...data })
      }
    },
    mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force = false): void {
      const rn = routeName || 'index'
      const key = `${locale}:${rn}`
      const existing = translations.get(key) ?? {}
      translations.set(key, { ...existing, ...newTranslations })
    },
    clearCache(): void {
      translations.clear()
    },
  }
}
