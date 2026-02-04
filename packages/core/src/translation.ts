import type { Translations } from '@i18n-micro/types'

// Duck-typing для Ref, чтобы не тащить Vue зависимость
export interface RefLike<T> {
  value: T
}

export interface TranslationCache {
  generalLocaleCache: RefLike<Record<string, Translations>> | Record<string, Translations>
  routeLocaleCache: RefLike<Record<string, Translations>> | Record<string, Translations>
  dynamicTranslationsCaches: RefLike<Record<string, Translations>[]> | Record<string, Translations>[]
  serverTranslationCache: RefLike<Record<string, Map<string, Translations | unknown>>> | Record<string, Map<string, Translations | unknown>>
}

// Глобальные кэши для fallback (только для unit-тестов и обратной совместимости)
// НЕ используются в SSR продакшене
const globalGeneralLocaleCache: Record<string, Translations> = {}
const globalRouteLocaleCache: Record<string, Translations> = {}
const globalDynamicTranslationsCaches: Record<string, Translations>[] = []
const globalServerTranslationCache: Record<string, Map<string, Translations | unknown>> = {}

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

// Вспомогательная функция для получения значения из Ref или обычного объекта
function getValue<T>(refOrValue: RefLike<T> | T): T {
  return typeof refOrValue === 'object' && refOrValue !== null && 'value' in refOrValue
    ? (refOrValue as RefLike<T>).value
    : refOrValue as T
}

// Вспомогательная функция для установки значения в Ref или обычный объект
function setValue<T extends Record<string, unknown>>(
  refOrValue: RefLike<T> | T,
  key: string,
  value: T[keyof T],
): void {
  const target = getValue(refOrValue)
  ;(target as Record<string, unknown>)[key] = value
}

// Вспомогательная функция для получения значения из Ref или обычного объекта по ключу
function getValueByKey<T extends Record<string, unknown>>(refOrValue: RefLike<T> | T, key: string): T[keyof T] | undefined {
  const target = getValue(refOrValue)
  return (target as Record<string, unknown>)[key] as T[keyof T] | undefined
}

export function useTranslationHelper(caches?: TranslationCache) {
  // Используем переданные кэши или глобальные (fallback для тестов)
  const generalLocaleCache = caches?.generalLocaleCache ?? globalGeneralLocaleCache
  const routeLocaleCache = caches?.routeLocaleCache ?? globalRouteLocaleCache
  const dynamicTranslationsCaches = caches?.dynamicTranslationsCaches ?? globalDynamicTranslationsCaches
  const serverTranslationCache = caches?.serverTranslationCache ?? globalServerTranslationCache

  return {
    hasCache(locale: string, page: string) {
      const cacheKey = `${locale}:${page}`
      const cache = getValueByKey(serverTranslationCache, cacheKey)
      return (cache ?? new Map<string, Translations | unknown>()).size > 0
    },
    getCache(locale: string, routeName: string) {
      const cacheKey = `${locale}:${routeName}`
      return getValueByKey(serverTranslationCache, cacheKey)
    },
    setCache(locale: string, routeName: string, cache: Map<string, Translations | unknown>) {
      const cacheKey = `${locale}:${routeName}`
      setValue(serverTranslationCache, cacheKey, cache)
    },
    mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force = false) {
      const cacheKey = `${locale}:${routeName}`
      const currentCache = getValueByKey(routeLocaleCache, cacheKey)

      // Всегда создаем объект, если его нет. defineI18nRoute может сработать до загрузки (HMR, порядок хуков).
      const existing = currentCache ?? {}
      setValue(routeLocaleCache, cacheKey, {
        ...existing,
        ...newTranslations,
      })
    },
    mergeGlobalTranslation(locale: string, newTranslations: Translations, force = false) {
      const currentCache = getValueByKey(generalLocaleCache, locale)
      if (!force && !currentCache) {
        console.error(`marge: route ${locale} not loaded`)
      }
      const existing = currentCache ?? {}
      setValue(generalLocaleCache, locale, {
        ...existing,
        ...newTranslations,
      })
    },
    hasGeneralTranslation(locale: string) {
      return !!getValueByKey(generalLocaleCache, locale)
    },
    hasPageTranslation(locale: string, routeName: string) {
      const cacheKey = `${locale}:${routeName}`

      return !!getValueByKey(routeLocaleCache, cacheKey)
    },
    hasTranslation: (locale: string, key: import('@i18n-micro/types').TranslationKey): boolean => {
      const dynamicCaches = getValue(dynamicTranslationsCaches)
      for (const dynamicCache of dynamicCaches) {
        if (findTranslation(dynamicCache[locale] || null, key) !== null) {
          return true
        }
      }

      const generalCache = getValueByKey(generalLocaleCache, locale)
      return findTranslation(generalCache || null, key) !== null
    },
    getTranslation: <T = unknown>(locale: string, routeName: string, key: import('@i18n-micro/types').TranslationKey): T | null => {
      const cacheKey = `${locale}:${routeName}`
      const serverCache = getValueByKey(serverTranslationCache, cacheKey)
      const cached = serverCache?.get(key)
      if (cached) {
        return cached as T
      }

      let result: T | null = null

      const dynamicCaches = getValue(dynamicTranslationsCaches)
      for (const dynamicCache of dynamicCaches) {
        result = findTranslation<T>(dynamicCache[locale] || null, key)
        if (result !== null) break
      }

      if (!result) {
        const routeCache = getValueByKey(routeLocaleCache, cacheKey)
        const generalCache = getValueByKey(generalLocaleCache, locale)
        result = findTranslation<T>(routeCache || null, key)
          ?? findTranslation<T>(generalCache || null, key)
      }

      if (result) {
        const currentServerCache = serverCache ?? new Map<string, Translations | unknown>()
        currentServerCache.set(key, result)
        setValue(serverTranslationCache, cacheKey, currentServerCache)
      }

      return result
    },
    async loadPageTranslations(locale: string, routeName: string, translations: Translations): Promise<void> {
      const cacheKey = `${locale}:${routeName}`
      setValue(routeLocaleCache, cacheKey, { ...translations })
    },
    async loadTranslations(locale: string, translations: Translations): Promise<void> {
      setValue(generalLocaleCache, locale, { ...translations })
    },
    clearCache() {
      // Clear general cache
      const generalCache = getValue(generalLocaleCache)
      Object.keys(generalCache).forEach((key) => {
        setValue(generalLocaleCache, key, {})
      })

      // Clear route-specific cache
      const routeCache = getValue(routeLocaleCache)
      Object.keys(routeCache).forEach((key) => {
        setValue(routeLocaleCache, key, {})
      })

      // Clear dynamic caches
      const dynamicCaches = getValue(dynamicTranslationsCaches)
      dynamicCaches.length = 0

      // Clear server translation cache
      const serverCache = getValue(serverTranslationCache)
      Object.keys(serverCache).forEach((key) => {
        const cacheMap = getValueByKey(serverTranslationCache, key)
        cacheMap?.clear()
      })
    },
  }
}
