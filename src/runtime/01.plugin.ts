import type { RouteLocationRaw, RouteRecordName } from 'vue-router'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRoute, useRouter, watch } from '#imports'
import type { ModuleOptions } from '~/src/module'

// Интерфейс для переводов, поддерживающий разные типы данных
interface Translations {
  [key: string]: string | number | boolean | Translations | PluralTranslations | unknown[] | null
}

interface PluralTranslations {
  singular: string
  plural: string
}

interface State extends ModuleOptions {
  translations: { [key: string]: Translations }
  rootDir: string
}

function interpolate(template: string, params: Record<string, string | number | boolean>): string {
  return template.replace(/\{(\w+)\}/g, (_, match) => {
    return params[match] !== undefined ? String(params[match]) : `{${match}}`
  })
}

// Кэш для хранения переводов общего файла (locale.json)
const generalLocaleCache: { [key: string]: Translations } = {}

// Кэш для хранения переводов для страниц (routeName_locale.json)
const routeLocaleCache: { [key: string]: Translations } = {}

// Массив для хранения нескольких наборов динамически загруженных переводов
const dynamicTranslationsCaches: { [key: string]: Translations }[] = []

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
function getTranslation<T = unknown>(translations: Translations, key: string): Translations | null | string | number | boolean {
  if (Object.prototype.hasOwnProperty.call(translations, key)) {
    const value = translations[key]
    // If the value is an object or an array, clone it to avoid mutation
    if (typeof value === 'object' && value !== null) {
      return deepClone(value) as Translations
    }

    return value
  }

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
  let finalResult: Translations | null
  if (result && (typeof result === 'object' || Array.isArray(result))) {
    finalResult = deepClone(result) as Translations
  }
  else {
    finalResult = (result as T) ?? null
  }

  return finalResult
}

// Функция для получения перевода с числом (singular/plural)
function getPluralTranslation(translations: Translations, key: string): string | null {
  const translation = getTranslation<string>(translations, key)

  if (!translation || typeof translation !== 'string') {
    return null
  }

  return translation
}

export default defineNuxtPlugin(async (_nuxtApp) => {
  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()

  const i18nConfig: State = config.public.myModule as State

  const registerI18nModule = async (translations: Translations, locale: string) => {
    dynamicTranslationsCaches.push({ [locale]: translations })
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  await _nuxtApp.callHook('i18n:register', registerI18nModule)

  const loadTranslations = async () => {
    const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
    const translationDir = i18nConfig.translationDir
    const routeName = (route.name as string).replace(`localized-`, '')

    if (!generalLocaleCache[locale]) {
      try {
        const translations = await import(`~/${translationDir}/${locale}.json`)
        generalLocaleCache[locale] = { ...translations.default }
      }
      catch {
        return { error: `Translations ${locale} not found` }
      }
    }

    if (!routeLocaleCache[`${locale}:${routeName}`]) {
      try {
        const translations = await import(`~/${translationDir}/pages/${routeName}_${locale}.json`)
        routeLocaleCache[`${locale}:${routeName}`] = { ...translations.default }
      }
      catch {
        return { error: `Translations ${routeName}_${locale} not found` }
      }
    }
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

  return {
    provide: {
      getLocale: () => {
        return (route.params?.locale ?? i18nConfig.defaultLocale).toString()
      },
      getLocales: () => {
        return i18nConfig.locales || []
      },
      t: <T extends Record<string, string | number | boolean>>(
        key: string,
        params?: T,
        defaultValue?: string,
      ): string | number | boolean | Translations | PluralTranslations | unknown[] | null => {
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        const routeName = (route.name as string).replace(`localized-`, '')

        let value: string | number | boolean | Translations | PluralTranslations | unknown[] | null = null

        if (routeLocaleCache[`${locale}:${routeName}`]) {
          value = getTranslation(routeLocaleCache[`${locale}:${routeName}`], key)
        }
        if (!value && generalLocaleCache[locale]) {
          value = getTranslation(generalLocaleCache[locale], key)
        }

        if (!value) {
          // Проверка во всех динамических переводах
          for (const translations of dynamicTranslationsCaches) {
            value = getTranslation(translations[locale] ?? {}, key)
            if (value) break
          }
        }

        if (!value && defaultValue) {
          value = defaultValue
        }

        if (typeof value === 'string' && params) {
          value = interpolate(value, params)
        }

        return value
      },
      tc: (key: string, count: number, defaultValue?: string) => {
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        const routeName = (route.name as string).replace(`localized-`, '')

        let translation: string | null = null

        if (routeLocaleCache[`${locale}:${routeName}`]) {
          translation = getPluralTranslation(routeLocaleCache[`${locale}:${routeName}`], key)
        }
        if (!translation && generalLocaleCache[locale]) {
          translation = getPluralTranslation(generalLocaleCache[locale], key)
        }

        if (!translation) {
          // Проверка во всех динамических переводах
          for (const translations of dynamicTranslationsCaches) {
            translation = getPluralTranslation(translations[locale] ?? {}, key)
            if (translation) break
          }
        }

        if (!translation) {
          translation = defaultValue || key
        }

        const forms = translation.split('|')
        let result: string

        // Determine which form to use based on the count
        if (count === 0 && forms.length > 2) {
          result = forms[0].trim() // Case for "no apples"
        }
        else if (count === 1 && forms.length > 1) {
          result = forms[1].trim() // Case for "one apple"
        }
        else {
          result = forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim() // Case for "multiple apples"
        }

        // Replace {count} placeholder with the actual count
        return result.replace('{count}', count.toString())
      },
      mergeTranslations: (newTranslations: Translations) => {
        const routeName = (route.name as string).replace(`localized-`, '')
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        routeLocaleCache[`${locale}:${routeName}`] = {
          ...generalLocaleCache[locale],
          ...newTranslations,
        }
      },
      switchLocale: (locale: string) => {
        const checkLocale = i18nConfig.locales?.find(l => l.code === locale)

        if (!checkLocale) {
          console.warn(`Locale ${locale} is not available`)
          return
        }

        const { defaultLocale } = i18nConfig
        const currentLocale = route.params.locale || defaultLocale

        let routeName = route.name as string

        if (currentLocale !== defaultLocale) {
          routeName = routeName.replace(`localized-`, '')
        }

        const newRouteName = locale === defaultLocale ? routeName : `localized-${routeName}`

        const newParams = { ...route.params }
        delete newParams.locale
        if (locale !== defaultLocale) {
          newParams.locale = locale
        }

        window.location.href = router.resolve({ name: newRouteName, params: newParams }).fullPath
      },
      localeRoute: (to: RouteLocationRaw): RouteLocationRaw => {
        const { defaultLocale } = i18nConfig
        const currentLocale = (route.params.locale || defaultLocale)!.toString()

        let resolvedRoute = router.resolve(to)

        if (typeof to === 'object' && 'name' in to) {
          resolvedRoute = router.resolve({ name: to.name, params: to.params, query: to.query, hash: to.hash })
          delete resolvedRoute.params.locale

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

        return resolvedRoute
      },
    },
  }
})
