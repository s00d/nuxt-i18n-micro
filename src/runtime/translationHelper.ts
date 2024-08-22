import type { Translations } from './plugins/01.plugin'

const generalLocaleCache: { [key: string]: Translations } = {}
const routeLocaleCache: { [key: string]: Translations } = {}
const dynamicTranslationsCaches: { [key: string]: Translations }[] = []

const serverTranslationCache: { [index: string]: Map<string, Translations | unknown> } = { }
const serverTranslationInit: { [index: string]: boolean } = { }

function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.slice() as T
  }
  else if (typeof value === 'object' && value !== null) {
    return { ...value } as T
  }
  return value
}

function findTranslation<T = unknown>(translations: Translations | null, parts: string[]): T | null {
  let value: string | number | boolean | Translations | unknown | null = translations

  for (let i = 0; i < parts.length; i++) {
    if (value && typeof value === 'object' && parts[i] in value) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      value = value[parts[i]]
    }
    else {
      return null
    }
  }

  if (typeof value === 'object' && value !== null) {
    return deepClone(value) as T
  }

  return value as T ?? null
}

export function useTranslationHelper() {
  return {
    hasCache(locale: string, page: string) {
      return serverTranslationInit[`${locale}:${page}`] ?? false
    },
    getCache(locale: string, routeName: string) {
      return serverTranslationCache[`${locale}:${routeName}`]
    },
    setCache(locale: string, routeName: string, cache: Map<string, Translations | unknown>) {
      serverTranslationCache[`${locale}:${routeName}`] = cache
      serverTranslationInit[`${locale}:index`] = true
      serverTranslationInit[`${locale}:${routeName}`] = true
    },
    margeTranslation(locale: string, routeName: string, newTranslations: Translations) {
      if (!routeLocaleCache[`${locale}:${routeName}`]) {
        console.error(`marge: route ${locale}:${routeName} not loaded`)
      }
      routeLocaleCache[`${locale}:${routeName}`] = {
        ...routeLocaleCache[`${locale}:${routeName}`],
        ...newTranslations,
      }
    },
    margeGlobalTranslation(locale: string, newTranslations: Translations) {
      if (!generalLocaleCache[`${locale}`]) {
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
    getTranslation: <T = unknown>(locale: string, routeName: string, key: string, useCache: boolean): T | null => {
      const cacheKey = `${locale}:${routeName}`
      if (useCache && serverTranslationCache[cacheKey]) {
        const cached = serverTranslationCache[cacheKey].get(key)
        if (cached) {
          return cached as T
        }
      }

      const parts = key.split('.')

      let result: null | T = null

      if (dynamicTranslationsCaches.length) {
        for (const dynamicCache of dynamicTranslationsCaches) {
          const value = findTranslation<T>(dynamicCache[locale], parts)
          if (value !== null) {
            result = value
          }
        }
      }

      if (!result) {
        // First, try to find the translation in the route-specific cache
        const value = findTranslation<T>(routeLocaleCache[`${locale}:${routeName}`], parts)
        if (value !== null) {
          result = value
        }
      }

      if (!result) {
        const value = findTranslation<T>(generalLocaleCache[locale], parts)

        if (value !== null) {
          return value
        }
      }

      if (useCache && result) {
        if (!serverTranslationCache[cacheKey]) {
          serverTranslationCache[cacheKey] = new Map<string, Translations>()
        }

        serverTranslationCache[cacheKey].set(key, result)
      }

      return result
    },
    loadPageTranslations: async (locale: string, routeName: string, translations: Translations): Promise<void> => {
      try {
        routeLocaleCache[`${locale}:${routeName}`] = { ...translations }
        serverTranslationInit[`${locale}:${routeName}`] = true
      }
      catch (error) {
        console.error(`Error loading translations for ${locale} and ${routeName}:`, error)
      }
    },
    loadTranslations: async (locale: string, translations: Translations): Promise<void> => {
      try {
        generalLocaleCache[locale] = { ...translations }
        serverTranslationInit[`${locale}:index`] = true
      }
      catch (error) {
        console.error(`Error loading translations for general ${locale}:`, error)
      }
    },
  }
}
