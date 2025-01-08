import type { Translations } from './types'

const generalLocaleCache: Record<string, Translations> = {}
const routeLocaleCache: Record<string, Translations> = {}
const dynamicTranslationsCaches: Record<string, Translations>[] = []

const serverTranslationCache: Record<string, Map<string, Translations | unknown>> = {}

function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return JSON.parse(JSON.stringify(value)) as T
  }
  else if (typeof value === 'object' && value !== null) {
    return JSON.parse(JSON.stringify(value)) as T
  }
  return value
}

function findTranslation<T = unknown>(translations: Translations | null, key: string): T | null {
  let value: string | number | boolean | Translations | unknown | null = translations

  if (translations === null || typeof key !== 'string') {
    return null
  }

  if (translations[key]) {
    value = translations[key]
  }
  else {
    const parts = key.toString().split('.')
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Translations)[part]
      }
      else {
        return null
      }
    }
  }

  if (typeof value === 'object' && value !== null) {
    return deepClone(value) as T
  }

  return (value as T) ?? null
}

export function useTranslationHelper() {
  let _locale = 'en'
  return {
    getLocale() {
      return _locale
    },
    setLocale(locale: string) {
      _locale = locale
    },
    getCache(routeName: string) {
      return serverTranslationCache[`${_locale}:${routeName}`]
    },
    setCache(routeName: string, cache: Map<string, Translations | unknown>) {
      serverTranslationCache[`${_locale}:${routeName}`] = cache
    },
    mergeTranslation(routeName: string, newTranslations: Translations, force = false) {
      if (!force && !routeLocaleCache[`${_locale}:${routeName}`]) {
        console.error(`marge: route ${_locale}:${routeName} not loaded`)
      }
      routeLocaleCache[`${_locale}:${routeName}`] = {
        ...routeLocaleCache[`${_locale}:${routeName}`],
        ...newTranslations,
      }
    },
    mergeGlobalTranslation(newTranslations: Translations, force = false) {
      if (!force && !generalLocaleCache[`${_locale}`]) {
        console.error(`marge: route ${_locale} not loaded`)
      }
      generalLocaleCache[_locale] = {
        ...generalLocaleCache[_locale],
        ...newTranslations,
      }
    },
    hasGeneralTranslation() {
      return !!generalLocaleCache[_locale]
    },
    hasPageTranslation(routeName: string) {
      return !!routeLocaleCache[`${_locale}:${routeName}`]
    },
    hasTranslation: (key: string): boolean => {
      for (const dynamicCache of dynamicTranslationsCaches) {
        if (findTranslation(dynamicCache[_locale] || null, key) !== null) {
          return true
        }
      }

      return findTranslation(generalLocaleCache[_locale] || null, key) !== null
    },
    getTranslation: <T = unknown>(routeName: string, key: string): T | null => {
      const cacheKey = `${_locale}:${routeName}`
      const cached = serverTranslationCache[cacheKey]?.get(key)
      if (cached) {
        return cached as T
      }

      let result: T | null = null

      for (const dynamicCache of dynamicTranslationsCaches) {
        result = findTranslation<T>(dynamicCache[_locale] || null, key)
        if (result !== null) break
      }

      if (!result) {
        result = findTranslation<T>(routeLocaleCache[cacheKey] || null, key)
        ?? findTranslation<T>(generalLocaleCache[_locale] || null, key)
      }

      if (result) {
        if (!serverTranslationCache[cacheKey]) {
          serverTranslationCache[cacheKey] = new Map<string, Translations>()
        }

        serverTranslationCache[cacheKey].set(key, result)
      }

      return result
    },
    async loadPageTranslations(routeName: string, translations: Translations): Promise<void> {
      const cacheKey = `${_locale}:${routeName}`
      routeLocaleCache[cacheKey] = { ...translations }
    },
    async loadTranslations(translations: Translations): Promise<void> {
      generalLocaleCache[_locale] = { ...translations }
    },
  }
}
