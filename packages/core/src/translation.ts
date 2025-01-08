import type { Translations } from './types'

const generalLocaleCache = new Map<string, Translations>()
const routeLocaleCache = new Map<string, Translations>()
const dynamicTranslationsCaches: Map<string, Translations>[] = []

const serverTranslationCache = new Map<string, Map<string, Translations | unknown>>()

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
    hasCache(routeName: string) {
      return (serverTranslationCache.get(`${_locale}:${routeName}`) ?? new Map<string, Translations | unknown>()).size > 0
    },
    getCache(routeName: string) {
      return serverTranslationCache.get(`${_locale}:${routeName}`)
    },
    setCache(routeName: string, cache: Map<string, Translations | unknown>) {
      serverTranslationCache.set(`${_locale}:${routeName}`, cache)
    },
    mergeTranslation(routeName: string, newTranslations: Translations, force = false) {
      if (!force && !routeLocaleCache.has(`${_locale}:${routeName}`)) {
        console.error(`marge: route ${_locale}:${routeName} not loaded`)
      }
      routeLocaleCache.set(`${_locale}:${routeName}`, {
        ...routeLocaleCache.get(`${_locale}:${routeName}`),
        ...newTranslations,
      })
    },
    mergeGlobalTranslation(newTranslations: Translations, force = false) {
      if (!force && !generalLocaleCache.get(_locale)) {
        console.error(`marge: route ${_locale} not loaded`)
      }
      generalLocaleCache.set(_locale, {
        ...generalLocaleCache.get(_locale),
        ...newTranslations,
      })
    },
    hasGeneralTranslation() {
      return generalLocaleCache.has(_locale)
    },
    hasPageTranslation(routeName: string) {
      return routeLocaleCache.has(`${_locale}:${routeName}`)
    },
    hasTranslation: (key: string): boolean => {
      for (const dynamicCache of dynamicTranslationsCaches) {
        if (findTranslation(dynamicCache.get(_locale) || null, key) !== null) {
          return true
        }
      }

      return findTranslation(generalLocaleCache.get(_locale) || null, key) !== null
    },
    getTranslation: <T = unknown>(routeName: string, key: string): T | null => {
      const cacheKey = `${_locale}:${routeName}`
      const cached = serverTranslationCache.get(cacheKey)?.get(key)
      if (cached) {
        return cached as T
      }

      let result: T | null = null

      for (const dynamicCache of dynamicTranslationsCaches) {
        result = findTranslation<T>(dynamicCache.get(_locale) || null, key)
        if (result !== null) break
      }

      if (!result) {
        result = findTranslation<T>(routeLocaleCache.get(cacheKey) || null, key)
        ?? findTranslation<T>(generalLocaleCache.get(_locale) || null, key)
      }

      if (result) {
        if (!serverTranslationCache.get(cacheKey)) {
          serverTranslationCache.set(cacheKey, new Map<string, Translations>())
        }

        serverTranslationCache.get(cacheKey)!.set(key, result)
      }

      return result
    },
    async loadPageTranslations(routeName: string, translations: Translations): Promise<void> {
      const cacheKey = `${_locale}:${routeName}`
      routeLocaleCache.set(cacheKey, { ...translations })
    },
    async loadTranslations(translations: Translations): Promise<void> {
      generalLocaleCache.set(_locale, { ...translations })
    },
  }
}
