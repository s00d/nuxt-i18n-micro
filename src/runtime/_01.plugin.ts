// import type { NavigationFailure, RouteLocationNormalizedLoaded, RouteLocationRaw, Router } from 'vue-router'
// import type { ModuleOptions } from '../module'
// import { defineNuxtPlugin, useRuntimeConfig } from '#app'
// import { useRoute, useRouter } from '#imports'
//
// const isDev = process.env.NODE_ENV !== 'production'
//
// // Интерфейс для переводов, поддерживающий разные типы данных
// interface Translations {
//   [key: string]: string | number | boolean | Translations | PluralTranslations | unknown[] | null
// }
//
// interface PluralTranslations {
//   singular: string
//   plural: string
// }
//
// interface State extends ModuleOptions {
//   translations: { [key: string]: Translations }
//   rootDir: string
//   pluralString: string
// }
//
// // Кэш для хранения переводов, содержащий Map внутри объектов
// const generalLocaleCache: { [locale: string]: { translations: Translations, compiled: Map<string, Function> } } = {}
// const routeLocaleCache: { [localeRoute: string]: { translations: Translations, compiled: Map<string, Function> } } = {}
// const dynamicTranslationsCaches: { [key: string]: { translations: Translations, compiled: Map<string, Function> } }[] = []
//
// /**
//  * Клонирование объектов и массивов.
//  */
// function deepClone<T>(value: T): T {
//   if (Array.isArray(value)) {
//     return value.slice() as T
//   }
//   else if (typeof value === 'object' && value !== null) {
//     return { ...value } as T
//   }
//   return value
// }
//
// /**
//  * JIT-компиляция сообщения на лету.
//  */
// function compileMessage(value: any): any {
//   if (typeof value === 'string') {
//     return new Function('params', `
//       return \`${value.replace(/\{(\w+)\}/g, '${params["$1"]}')}\`;
//     `)
//   }
//
//   if (typeof value === 'object' && value !== null) {
//     const compiledObject: any = Array.isArray(value) ? [] : {}
//     for (const key in value) {
//       if (Object.prototype.hasOwnProperty.call(value, key)) {
//         compiledObject[key] = compileMessage(value[key])
//       }
//     }
//     return compiledObject
//   }
//
//   return value // Для значений, которые не являются строками или объектами, возвращаем как есть.
// }
//
// /**
//  * Получение перевода по ключу с JIT-компиляцией.
//  */
// function getTranslation<T = unknown>(
//   cache: { translations: Translations, compiled: Map<string, any> },
//   key: string,
//   params: Record<string, string | number | boolean> = {},
// ): T | null {
//   if (cache.compiled.has(key)) {
//     const compiledFnOrObj = cache.compiled.get(key)!
//
//     // Если это функция, выполняем ее, иначе возвращаем скомпилированный объект
//     if (typeof compiledFnOrObj === 'function') {
//       return compiledFnOrObj(params) as T
//     }
//     else {
//       return compiledFnOrObj as T
//     }
//   }
//
//   const value = key.split('.').reduce<Translations | T | undefined>((acc, part) => {
//     if (typeof acc === 'object' && acc !== null && part in acc) {
//       return acc[part] as Translations | T
//     }
//     return undefined
//   }, cache.translations)
//
//   const compiledValue = compileMessage(value)
//   cache.compiled.set(key, compiledValue)
//
//   // Если это функция, выполняем ее, иначе возвращаем скомпилированный объект
//   if (typeof compiledValue === 'function') {
//     return compiledValue(params) as T
//   }
//   else {
//     return compiledValue as T
//   }
// }
//
// /**
//  * Загрузка переводов для конкретной локали и маршрута.
//  */
// async function loadTranslations(locale: string, routeName: string, translationDir: string): Promise<void> {
//   try {
//     if (!generalLocaleCache[locale]) {
//       const translations = await import(`~/${translationDir}/${locale}.json`)
//       generalLocaleCache[locale] = { translations: translations.default, compiled: new Map() }
//     }
//
//     const localeRouteKey = `${locale}:${routeName}`
//     if (!routeLocaleCache[localeRouteKey]) {
//       const translations = await import(`~/${translationDir}/pages/${routeName}/${locale}.json`)
//       routeLocaleCache[localeRouteKey] = { translations: translations.default, compiled: new Map() }
//     }
//   }
//   catch (error) {
//     console.error(`Error loading translations for ${locale} and ${routeName}:`, error)
//   }
// }
//
// /**
//  * Объединение новой порции переводов с существующими.
//  */
// function mergeTranslations(routeName: string, locale: string, newTranslations: Translations): void {
//   const localeRouteKey = `${locale}:${routeName}`
//   routeLocaleCache[localeRouteKey] = {
//     translations: {
//       ...generalLocaleCache[locale]?.translations,
//       ...newTranslations,
//     },
//     compiled: new Map(), // сброс компилированных функций, так как структура могла измениться
//   }
// }
//
// /**
//  * Переключение текущей локали и перенаправление на новый локализованный маршрут.
//  */
// function switchLocale(locale: string, route: RouteLocationNormalizedLoaded, router: Router, i18nConfig: State): Promise<NavigationFailure | null | undefined | void> {
//   const checkLocale = i18nConfig.locales?.find(l => l.code === locale)
//
//   if (!checkLocale) {
//     console.warn(`Locale ${locale} is not available`)
//     return Promise.reject(`Locale ${locale} is not available`)
//   }
//
//   const { defaultLocale } = i18nConfig
//   const routeName = (route.name as string).replace(`localized-`, '')
//
//   const newRouteName = locale !== defaultLocale || i18nConfig.includeDefaultLocaleRoute ? `localized-${routeName}` : routeName
//   const newParams = { ...route.params }
//   delete newParams.locale
//
//   if (locale !== defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
//     newParams.locale = locale
//   }
//   return router.push({ name: newRouteName, params: newParams })
// }
//
// /**
//  * Получение локализованного маршрута.
//  */
// function getLocalizedRoute(to: RouteLocationRaw, router: Router, route: RouteLocationNormalizedLoaded, i18nConfig: State, locale?: string): RouteLocationRaw {
//   const { defaultLocale } = i18nConfig
//   const currentLocale = (locale || route.params.locale || defaultLocale)!.toString()
//
//   const selectRoute = router.resolve(to)
//
//   const routeName = (selectRoute.name as string).replace(`localized-`, '')
//   const newRouteName = currentLocale !== defaultLocale || i18nConfig.includeDefaultLocaleRoute ? `localized-${routeName}` : routeName
//   const newParams = { ...route.params }
//   delete newParams.locale
//
//   if (currentLocale !== defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
//     newParams.locale = currentLocale
//   }
//
//   return router.resolve({ name: newRouteName, params: newParams })
// }
//
// export default defineNuxtPlugin(async (_nuxtApp) => {
//   const router = useRouter()
//   const route = useRoute()
//   const config = useRuntimeConfig()
//   const i18nConfig: State = config.public.i18nConfig as State
//
//   const initialLocale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
//   const initialRouteName = (route.name as string).replace(`localized-`, '')
//
//   const plural = new Function('return ' + i18nConfig.plural)()
//
//   router.beforeEach(async (to, from, next) => {
//     const locale = (to.params?.locale ?? i18nConfig.defaultLocale).toString()
//     const routeName = (to.name as string).replace(`localized-`, '')
//
//     if (!routeLocaleCache[`${locale}:${routeName}`]) {
//       await loadTranslations(locale, routeName, i18nConfig.translationDir!)
//     }
//
//     next()
//   })
//
//   await loadTranslations(initialLocale, initialRouteName, i18nConfig.translationDir!)
//
//   return {
//     provide: {
//       getLocale: () => (route.params?.locale ?? i18nConfig.defaultLocale).toString(),
//       getLocales: () => i18nConfig.locales || [],
//       t: <T extends Record<string, string | number | boolean>>(
//         key: string,
//         params?: T,
//         defaultValue?: string,
//       ): string | number | boolean | Translations | PluralTranslations | unknown[] | unknown | null => {
//         if (!key) {
//           console.log(`$t: key not exist`)
//           return ''
//         }
//         const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
//
//         const routeName = (route.name as string).replace(`localized-`, '')
//
//         let value = getTranslation(routeLocaleCache[`${locale}:${routeName}`] ?? { translations: {}, compiled: new Map() }, key, params)
//           || getTranslation(generalLocaleCache[locale] ?? { translations: {}, compiled: new Map() }, key, params)
//           || dynamicTranslationsCaches.reduce((result, cache) => {
//             return result || getTranslation(cache[locale] ?? { translations: {}, compiled: new Map() }, key, params)
//           }, null as unknown)
//
//         if (!value) {
//           if (isDev && import.meta.client) {
//             console.warn(`Not found '${key}' key in '${locale}' locale messages.`)
//           }
//           value = defaultValue || key
//         }
//
//         return value
//       },
//       tc: (key: string, count: number, defaultValue?: string): string => {
//         if (!key) {
//           console.log(`$tc: key not exist`)
//           return ''
//         }
//         const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
//         const routeName = (route.name as string).replace(`localized-`, '')
//
//         let translation = getTranslation(routeLocaleCache[`${locale}:${routeName}`] ?? { translations: {}, compiled: new Map() }, key)
//           || getTranslation(generalLocaleCache[locale] ?? { translations: {}, compiled: new Map() }, key)
//           || dynamicTranslationsCaches.reduce((result, cache) => {
//             return result || getTranslation(cache[locale] ?? { translations: {}, compiled: new Map() }, key)
//           }, null as unknown)
//
//         if (!translation) {
//           if (isDev && import.meta.client) {
//             console.warn(`Not found '${key}' key in '${locale}' locale messages.`)
//           }
//           translation = defaultValue || key
//         }
//
//         return plural(translation!.toString(), count, locale) as string
//       },
//       mergeTranslations: (newTranslations: Translations) => {
//         const routeName = (route.name as string).replace(`localized-`, '')
//         const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
//         mergeTranslations(routeName, locale, newTranslations)
//       },
//       switchLocale: (locale: string) => {
//         switchLocale(locale, route, router, i18nConfig)
//       },
//       localeRoute: (to: RouteLocationRaw, locale?: string): RouteLocationRaw => {
//         return getLocalizedRoute(to, router, route, i18nConfig, locale)
//       },
//     },
//   }
// })
//
// export interface PluginsInjections {
//   $getLocale: () => string
//   $getLocales: () => string[]
//   $t: <T extends Record<string, string | number | boolean>>(
//     key: string,
//     params?: T,
//     defaultValue?: string
//   ) => string | number | boolean | Translations | PluralTranslations | unknown[] | unknown | null
//   $tc: (key: string, count: number, defaultValue?: string) => string
//   $mergeTranslations: (newTranslations: Translations) => void
//   $switchLocale: (locale: string) => void
//   $localeRoute: (to: RouteLocationRaw, locale?: string) => RouteLocationRaw
//   $loadPageTranslations: (locale: string, routeName: string) => Promise<void>
// }
//
// declare module '#app' {
//   // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//   interface NuxtApp extends PluginsInjections {}
// }
//
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-expect-error
// declare module 'nuxt/dist/app/nuxt' {
//   // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//   interface NuxtApp extends PluginsInjections {}
// }
//
// declare module '@vue/runtime-core' {
//   // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//   interface ComponentCustomProperties extends PluginsInjections {}
// }
//
// declare module 'vue' {
//   // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//   interface ComponentCustomProperties extends PluginsInjections {}
// }
