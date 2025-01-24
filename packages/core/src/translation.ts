import type { Translations } from 'nuxt-i18n-micro-types'

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
  return {
    hasCache(locale: string, page: string) {
      return (serverTranslationCache[`${locale}:${page}`] ?? new Map<string, Translations | unknown>()).size > 0
    },
    getCache(locale: string, routeName: string) {
      return serverTranslationCache[`${locale}:${routeName}`]
    },
    setCache(locale: string, routeName: string, cache: Map<string, Translations | unknown>) {
      serverTranslationCache[`${locale}:${routeName}`] = cache
    },
    mergeTranslation(locale: string, routeName: string, newTranslations: Translations, force = false) {
      if (!force && !routeLocaleCache[`${locale}:${routeName}`]) {
        console.error(`marge: route ${locale}:${routeName} not loaded`)
      }
      routeLocaleCache[`${locale}:${routeName}`] = {
        ...routeLocaleCache[`${locale}:${routeName}`],
        ...newTranslations,
      }
    },
    mergeGlobalTranslation(locale: string, newTranslations: Translations, force = false) {
      if (!force && !generalLocaleCache[`${locale}`]) {
        console.error(`marge: route ${locale} not loaded`)
      }
      generalLocaleCache[locale] = {
        ...generalLocaleCache[locale],
        ...newTranslations,
      }
    },
    hasGeneralTranslation(locale: string) {
      return !!generalLocaleCache[locale]
    },
    hasPageTranslation(locale: string, routeName: string) {
      return !!routeLocaleCache[`${locale}:${routeName}`]
    },
    hasTranslation: (locale: string, key: string): boolean => {
      for (const dynamicCache of dynamicTranslationsCaches) {
        if (findTranslation(dynamicCache[locale] || null, key) !== null) {
          return true
        }
      }

      return findTranslation(generalLocaleCache[locale] || null, key) !== null
    },
    getTranslation: <T = unknown>(locale: string, routeName: string, key: string): T | null => {
      const cacheKey = `${locale}:${routeName}`
      const cached = serverTranslationCache[cacheKey]?.get(key)
      if (cached) {
        return cached as T
      }

      let result: T | null = null

      for (const dynamicCache of dynamicTranslationsCaches) {
        result = findTranslation<T>(dynamicCache[locale] || null, key)
        if (result !== null) break
      }

      if (!result) {
        result = findTranslation<T>(routeLocaleCache[cacheKey] || null, key)
          ?? findTranslation<T>(generalLocaleCache[locale] || null, key)
      }

      if (result) {
        if (!serverTranslationCache[cacheKey]) {
          serverTranslationCache[cacheKey] = new Map<string, Translations>()
        }

        serverTranslationCache[cacheKey].set(key, result)
      }

      return result
    },
    async loadPageTranslations(locale: string, routeName: string, translations: Translations): Promise<void> {
      const cacheKey = `${locale}:${routeName}`
      routeLocaleCache[cacheKey] = { ...translations }
    },
    async loadTranslations(locale: string, translations: Translations): Promise<void> {
      generalLocaleCache[locale] = { ...translations }
    },
  }
}
