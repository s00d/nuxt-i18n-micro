import type { CleanTranslation, Locale, Params, TranslationKey, Translations } from '@i18n-micro/types'
import type { AstroGlobal } from 'astro'
import type { AstroI18n } from './composer'
import type { I18nRoutingStrategy } from './router/types'
import './env.d'

/**
 * Get i18n instance from Astro context
 */
export function getI18n(astro: AstroGlobal): AstroI18n {
  const i18n = astro.locals.i18n
  if (!i18n) {
    throw new Error('i18n instance not found. Make sure i18n middleware is configured.')
  }
  // @ts-ignore private property mismatch between src and dist types
  return i18n
}

/**
 * Get current locale from Astro context
 */
export function getLocale(astro: AstroGlobal): string {
  return astro.locals.locale || 'en'
}

/**
 * Get default locale from Astro context
 */
export function getDefaultLocale(astro: AstroGlobal): string {
  return astro.locals.defaultLocale || 'en'
}

/**
 * Get all locales from Astro context
 */
export function getLocales(astro: AstroGlobal): Locale[] {
  return astro.locals.locales || []
}

/**
 * Get routing strategy from Astro locals
 */
function getRoutingStrategy(astro: AstroGlobal): I18nRoutingStrategy | null {
  return (astro.locals.routingStrategy as I18nRoutingStrategy | undefined) || null
}

/**
 * Use i18n in Astro pages/components
 * Returns helper functions for translations
 */
export function useI18n(astro: AstroGlobal) {
  const i18n = getI18n(astro)
  const locale = getLocale(astro)
  const defaultLocale = getDefaultLocale(astro)
  const locales = getLocales(astro)
  const localeCodes = locales.map((l) => l.code)
  const routingStrategy = getRoutingStrategy(astro)

  return {
    // Current locale
    locale,
    defaultLocale,
    locales,

    // Translation methods
    t: (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation => {
      return i18n.t(key, params, defaultValue, routeName)
    },
    ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string => {
      return i18n.ts(key, params, defaultValue, routeName)
    },
    tc: (key: TranslationKey, count: number | Params, defaultValue?: string): string => {
      return i18n.tc(key, count, defaultValue)
    },
    tn: (value: number, options?: Intl.NumberFormatOptions): string => {
      return i18n.tn(value, options)
    },
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string => {
      return i18n.td(value, options)
    },
    tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string => {
      return i18n.tdr(value, options)
    },
    has: (key: TranslationKey, routeName?: string): boolean => {
      return i18n.has(key, routeName)
    },

    // Route management
    getRoute: (): string => {
      return i18n.getRoute()
    },
    getRouteName: (path?: string): string => {
      const targetPath = path || astro.url.pathname
      if (routingStrategy?.getRouteName) {
        return routingStrategy.getRouteName(targetPath, localeCodes)
      }
      // Fallback: basic route name extraction
      const cleanPath = targetPath.replace(/^\//, '').replace(/\/$/, '')
      if (!cleanPath) return 'index'
      const segments = cleanPath.split('/').filter(Boolean)
      const firstSegment = segments[0]
      if (firstSegment && localeCodes.includes(firstSegment)) {
        segments.shift()
      }
      return segments.length === 0 ? 'index' : segments.join('-')
    },
    getLocaleFromPath: (path?: string): string => {
      const targetPath = path || astro.url.pathname
      if (routingStrategy?.getLocaleFromPath) {
        return routingStrategy.getLocaleFromPath(targetPath, defaultLocale, localeCodes)
      }
      // Fallback: check first segment
      const segments = targetPath.split('/').filter(Boolean)
      const firstSegment = segments[0]
      return firstSegment && localeCodes.includes(firstSegment) ? firstSegment : defaultLocale
    },

    // Path utilities
    switchLocalePath: (newLocale: string): string => {
      if (routingStrategy?.switchLocalePath) {
        return routingStrategy.switchLocalePath(astro.url.pathname, newLocale, localeCodes, defaultLocale)
      }
      // Fallback: basic locale switching
      const segments = astro.url.pathname.split('/').filter(Boolean)
      const firstSegment = segments[0]
      if (firstSegment && localeCodes.includes(firstSegment)) {
        segments.shift()
      }
      if (newLocale !== defaultLocale) {
        segments.unshift(newLocale)
      }
      return `/${segments.join('/')}`
    },
    localizePath: (path: string, targetLocale?: string): string => {
      if (routingStrategy?.localizePath) {
        return routingStrategy.localizePath(path, targetLocale || locale, localeCodes, defaultLocale)
      }
      // Fallback: basic localization
      const cleanPath = path.replace(/^\//, '').replace(/\/$/, '') || ''
      const segments = cleanPath.split('/').filter(Boolean)
      const firstSegment = segments[0]
      if (firstSegment && localeCodes.includes(firstSegment)) {
        segments.shift()
      }
      if (targetLocale && targetLocale !== defaultLocale) {
        segments.unshift(targetLocale)
      }
      return `/${segments.join('/')}`
    },

    // Get i18n instance
    getI18n: (): AstroI18n => {
      return i18n
    },

    // Get base path without locale (for rewrite)
    getBasePath: (url?: URL): string => {
      const targetUrl = url || astro.url
      const pathname = targetUrl.pathname
      const segments = pathname.split('/').filter(Boolean)

      // Remove locale from path if present
      const firstSegment = segments[0]
      if (firstSegment && localeCodes.includes(firstSegment)) {
        segments.shift()
      }

      const basePath = segments.length > 0 ? `/${segments.join('/')}` : '/'
      return basePath
    },

    // Translation management
    addTranslations: (locale: string, translations: Record<string, unknown>, merge: boolean = true): void => {
      i18n.addTranslations(locale, translations, merge)
    },
    addRouteTranslations: (locale: string, routeName: string, translations: Record<string, unknown>, merge: boolean = true): void => {
      i18n.addRouteTranslations(locale, routeName, translations, merge)
    },
    mergeTranslations: (locale: string, routeName: string, translations: Record<string, unknown>): void => {
      i18n.mergeTranslations(locale, routeName, translations)
    },
    mergeGlobalTranslations: (locale: string, translations: Record<string, unknown>): void => {
      i18n.mergeGlobalTranslations(locale, translations)
    },
    clearCache: (): void => {
      i18n.clearCache()
    },
  }
}

/**
 * Generate locale head meta tags for SEO
 */
export interface LocaleHeadOptions {
  baseUrl?: string
  addDirAttribute?: boolean
  addSeoAttributes?: boolean
}

export interface LocaleHeadResult {
  htmlAttrs: {
    lang?: string
    dir?: 'ltr' | 'rtl' | 'auto'
  }
  link: Array<{
    rel: string
    href: string
    hreflang?: string
  }>
  meta: Array<{
    property: string
    content: string
  }>
}

export function useLocaleHead(astro: AstroGlobal, options: LocaleHeadOptions = {}): LocaleHeadResult {
  const { baseUrl = '/', addDirAttribute = true, addSeoAttributes = true } = options

  const locale = getLocale(astro)
  const defaultLocale = getDefaultLocale(astro)
  const locales = getLocales(astro)
  const currentLocaleObj = locales.find((l) => l.code === locale)

  if (!currentLocaleObj) {
    return { htmlAttrs: {}, link: [], meta: [] }
  }

  const currentIso = currentLocaleObj.iso || locale
  const currentDir = currentLocaleObj.dir || 'auto'

  const result: LocaleHeadResult = {
    htmlAttrs: {
      lang: currentIso,
      ...(addDirAttribute ? { dir: currentDir } : {}),
    },
    link: [],
    meta: [],
  }

  if (!addSeoAttributes) {
    return result
  }

  // Canonical URL
  const canonicalUrl = `${baseUrl}${astro.url.pathname}`
  result.link.push({
    rel: 'canonical',
    href: canonicalUrl,
  })

  // Get routing strategy
  const routingStrategy = getRoutingStrategy(astro)
  const allLocaleCodes = locales.map((l) => l.code)

  // Alternate languages
  for (const loc of locales) {
    if (loc.code === locale) continue

    let alternatePath = astro.url.pathname
    if (routingStrategy?.switchLocalePath) {
      alternatePath = routingStrategy.switchLocalePath(astro.url.pathname, loc.code, allLocaleCodes, defaultLocale)
    } else {
      // Fallback: basic locale switching
      const segments = astro.url.pathname.split('/').filter(Boolean)
      const firstSegment = segments[0]
      if (firstSegment && allLocaleCodes.includes(firstSegment)) {
        segments.shift()
      }
      if (loc.code !== defaultLocale) {
        segments.unshift(loc.code)
      }
      alternatePath = `/${segments.join('/')}`
    }
    const alternateUrl = `${baseUrl}${alternatePath}`

    result.link.push({
      rel: 'alternate',
      href: alternateUrl,
      hreflang: loc.code,
    })

    if (loc.iso && loc.iso !== loc.code) {
      result.link.push({
        rel: 'alternate',
        href: alternateUrl,
        hreflang: loc.iso,
      })
    }
  }

  // Open Graph locale
  result.meta.push({
    property: 'og:locale',
    content: currentIso,
  })

  result.meta.push({
    property: 'og:url',
    content: canonicalUrl,
  })

  // Alternate OG locales
  for (const loc of locales) {
    if (loc.code === locale) continue
    result.meta.push({
      property: 'og:locale:alternate',
      content: loc.iso || loc.code,
    })
  }

  return result
}

/**
 * Props для передачи в клиентские острова (Vue, React, Svelte, Preact)
 */
export interface I18nClientProps {
  locale: string
  fallbackLocale: string
  translations: Record<string, Translations> // routeName -> translations
  currentRoute: string
}

/**
 * Создает вложенную структуру из ключа (например, 'islands.vue.title' -> { islands: { vue: { title: value } } })
 */
function setNestedValue(obj: Translations, key: string, value: unknown): void {
  const parts = key.split('.')
  let current: Translations = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    if (!current[part]) {
      current[part] = {}
    }
    current = current[part] as Translations
  }
  const last = parts[parts.length - 1]
  if (last !== undefined) {
    current[last] = value
  }
}

/**
 * Подготавливает пропсы для передачи в клиентский остров.
 * Принимает список ключей, которые нужно передать в остров.
 * Использует методы i18n для правильной работы с routesLocaleLinks.
 * currentRoute уже нормализован через middleware (getRouteName), поэтому используем его напрямую.
 */
export function getI18nProps(astro: AstroGlobal, keys?: string[]): I18nClientProps {
  const i18n = getI18n(astro)
  const locale = getLocale(astro)
  const fallbackLocale = getDefaultLocale(astro)
  // currentRoute уже нормализован через middleware.setRoute(getRouteName(...))
  // getRouteName учитывает routesLocaleLinks, если они настроены
  const currentRoute = i18n.getRoute()

  const translations: Record<string, Translations> = {}

  // Если указаны ключи, извлекаем только их из кэша
  if (keys && keys.length > 0) {
    const extracted: Translations = {}

    // Используем методы i18n для получения переводов
    // Это гарантирует правильную работу с routesLocaleLinks
    for (const key of keys) {
      // Используем i18n.t() который использует helper.getTranslation внутри
      // и правильно резолвит ключ кэша с учетом routesLocaleLinks
      const value = i18n.t(key, undefined, undefined, currentRoute)
      if (value !== null && value !== undefined && value !== key) {
        setNestedValue(extracted, key, value)
      }
    }

    if (Object.keys(extracted).length > 0) {
      translations[currentRoute] = extracted
    }
  } else {
    // Если ключи не указаны, берем route-specific переводы
    // Используем публичный метод getRouteTranslations для безопасного доступа
    const routeTrans = i18n.getRouteTranslations(locale, currentRoute)
    if (routeTrans) {
      translations[currentRoute] = routeTrans
    }
  }

  return {
    locale,
    fallbackLocale,
    currentRoute,
    translations,
  }
}
