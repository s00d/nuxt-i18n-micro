import type { RouteLocationRaw, RouteRecordName } from 'vue-router'
import { defineNuxtPlugin, useState } from '#app'
import { useRoute, useRouter, watch } from '#imports'

// Интерфейс для переводов, поддерживающий разные типы данных
interface Translations {
  [key: string]: string | number | boolean | Translations | PluralTranslations | unknown[] | null
}

interface PluralTranslations {
  singular: string
  plural: string
}

interface State {
  locale: string
  translations: { [key: string]: Translations }
  defaultLocale: string
  rootDir: string
  translationDir: string
  locales: string[]
}

// Кэш для хранения уже найденных переводов
const localeCache: { [key: string]: Translations } = {}
const translationCache: Record<string, unknown> = {}

// Функция для клонирования объектов и массивов
function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.slice() as T
  }
  else if (typeof value === 'object' && value !== null) {
    return { ...value } as T
  }
  return value
}

// Функция для получения перевода любого типа с кэшированием
function getTranslation<T = unknown>(translations: Translations, key: string, defaultValue?: T): T {
  const result = key.split('.').reduce<Translations | T | undefined>((acc, part) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (typeof acc === 'object' && acc !== null && acc[part] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return acc[part] as Translations | T
    }
    return undefined
  }, translations)

  // Если результат является объектом или массивом, клонируем его, чтобы избежать утечек
  let finalResult: T
  if (result && (typeof result === 'object' || Array.isArray(result))) {
    finalResult = deepClone(result) as T
  }
  else {
    finalResult = (result as T) ?? defaultValue ?? (key as unknown as T)
  }

  return finalResult
}

// Функция для получения перевода с числом (singular/plural)
function getPluralTranslation(translations: Translations, key: string): PluralTranslations | undefined {
  const result = getTranslation<PluralTranslations>(translations, key)
  if (result && typeof result === 'object' && 'singular' in result && 'plural' in result) {
    return result as PluralTranslations
  }

  return undefined
}

// Функция для множественного числа
function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const router = useRouter()
  const route = useRoute()
  // Используем состояние для хранения переводов и локали
  const i18nState = useState<State>('i18n', () => nuxtApp.ssrContext?.event.context.i18n || {})

  const loadTranslations = async () => {
    const locale = i18nState.value.locale
    const rootDir = i18nState.value.rootDir
    const translationDir = i18nState.value.translationDir
    const routeName = (route.name as string).replace(`localized-`, '')
    if (localeCache[`${locale}:${routeName}`]) {
      return
    }

    let result: { [key: string]: Translations } = {}

    try {
      const translations = await import(`~/${translationDir}/${locale}.json`)
      result = { ...translations.default }
    }
    catch (error: unknown) {
      return { error: `Translations ${locale} not found` }
    }

    try {
      const translations = await import(`~/${translationDir}/pages/${routeName}_${locale}.json`)
      result = { ...result, ...translations.default }
    }
    catch (error: unknown) {
      return { error: `Translations ${routeName}_${locale}} not found` }
    }

    console.log('loadTranslations')
    // const { data: translations } = await useFetch<Translations>(`/_nuxt/locales/${routeName}/${locale}/data.json`)
    localeCache[`${locale}:${routeName}`] = result || {}
  }

  let init = false
  watch(route, async () => {
    if (!init) {
      return
    }
    await loadTranslations()
  }, { immediate: true })

  await loadTranslations()
  init = true

  // Предоставляем метод для получения текущей локали
  nuxtApp.provide('getLocale', () => {
    return i18nState.value.locale
  })

  // Предоставляем метод для получения списка всех доступных локалей
  nuxtApp.provide('getLocales', () => {
    return i18nState.value.locales || []
  })

  // Предоставляем метод для перевода ключа
  nuxtApp.provide('t', (key: string, defaultValue?: string) => {
    // Если перевод уже есть в кэше, возвращаем его
    const cacheKey = i18nState.value.locale + ':' + key
    if (translationCache[cacheKey]) {
      console.log('cache', Date.now())
      return translationCache[cacheKey] as string
    }
    console.log('serch', Date.now())

    const locale = i18nState.value.locale
    const routeName = (route.name as string).replace(`localized-`, '')
    if (!localeCache[`${locale}:${routeName}`]) {
      return
    }

    const value = getTranslation(localeCache[`${locale}:${routeName}`], key, defaultValue)

    // Сохраняем результат в кэш для будущего использования
    translationCache[cacheKey] = value

    return value
  })

  // Метод для перевода с учетом количества
  nuxtApp.provide('tc', (key: string, count: number, defaultValue?: string) => {
    const locale = i18nState.value.locale
    const routeName = (route.name as string).replace(`localized-`, '')
    if (!localeCache[`${locale}:${routeName}`]) {
      return
    }
    const translation = getPluralTranslation(localeCache[`${locale}:${routeName}`], key)

    if (translation) {
      return pluralize(count, translation.singular, translation.plural)
    }

    // Если translation — это строка, используем ее как singular и добавляем "s" для plural
    const defaultTranslation = defaultValue || key
    return pluralize(count, defaultTranslation, `${defaultTranslation}s`)
  })

  // Метод для слияния новых переводов с существующими
  nuxtApp.provide('mergeTranslations', (newTranslations: Translations) => {
    const routeName = (route.name as string).replace(`localized-`, '')
    const locale = i18nState.value.locale
    localeCache[`${locale}:${routeName}`] = {
      ...localeCache[`${locale}:${routeName}`],
      ...newTranslations,
    }
  })

  // Метод для смены локали
  nuxtApp.provide('setLocale', (locale: string) => {
    if (i18nState.value.locales.includes(locale)) {
      i18nState.value.locale = locale
    }
    else {
      console.warn(`Locale ${locale} is not available`)
    }
  })

  nuxtApp.provide('switchLocale', (locale: string) => {
    if (!i18nState.value.locales.includes(locale)) {
      console.warn(`Locale ${locale} is not available`)
      return
    }

    const { defaultLocale } = i18nState.value
    const currentLocale = route.params.locale || defaultLocale

    // Получаем текущее имя маршрута
    let routeName = route.name as string

    // Убираем текущую локаль из имени маршрута, если она есть
    if (currentLocale !== defaultLocale) {
      routeName = routeName.replace(`localized-`, '')
    }

    // Формируем новое имя маршрута в зависимости от выбранной локали
    const newRouteName = locale === defaultLocale ? routeName : `localized-${routeName}`

    // Обновляем параметры маршрута, заменяя старую локаль на новую
    const newParams = { ...route.params }
    delete newParams.locale
    if (locale !== defaultLocale) {
      newParams.locale = locale
    }

    // Формируем новый URL для перенаправления
    // Перенаправляем на новый URL с перезагрузкой страницы
    window.location.href = router.resolve({ name: newRouteName, params: newParams }).fullPath
  })

  nuxtApp.provide('localeRoute', (to: RouteLocationRaw): RouteLocationRaw => {
    const { defaultLocale } = i18nState.value
    const currentLocale = route.params.locale || defaultLocale
    const router = useRouter()

    let resolvedRoute = router.resolve(to)

    // If 'to' is an object with a 'name' property, resolve it directly
    if (typeof to === 'object' && 'name' in to) {
      resolvedRoute = router.resolve({ name: to.name, params: to.params, query: to.query, hash: to.hash })
      delete resolvedRoute.params.locale

      // Apply locale-specific logic to the resolved route's name
      if (resolvedRoute.name) {
        if (currentLocale === defaultLocale) {
          resolvedRoute.name = (resolvedRoute.name as string).replace(`localized-`, '') as RouteRecordName
        }
        else {
          resolvedRoute.name = (`localized-${resolvedRoute.name.toString()}` as string) as RouteRecordName
          resolvedRoute.params.locale = currentLocale
        }
      }
    }

    // If we resolved a route, return the modified route object
    if (resolvedRoute) {
      return router.resolve({
        name: resolvedRoute.name as RouteRecordName,
        params: resolvedRoute.params,
        query: resolvedRoute.query,
        hash: resolvedRoute.hash,
      })
    }

    // If 'to' is neither a string nor an object with a name or path, return it unchanged
    return to
  })
})
