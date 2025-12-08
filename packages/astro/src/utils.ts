import type { AstroI18n } from './composer'
import type { Params, Locale, CleanTranslation, TranslationKey } from '@i18n-micro/types'
import { switchLocalePath, localizePath, getLocaleFromPath, getRouteName } from './routing'
import type { AstroGlobal } from 'astro'
import './env.d'

/**
 * Get i18n instance from Astro context
 */
export function getI18n(astro: AstroGlobal): AstroI18n {
  const i18n = astro.locals.i18n
  if (!i18n) {
    throw new Error('i18n instance not found. Make sure i18n middleware is configured.')
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
 * Use i18n in Astro pages/components
 * Returns helper functions for translations
 */
export function useI18n(astro: AstroGlobal) {
  const i18n = getI18n(astro)
  const locale = getLocale(astro)
  const defaultLocale = getDefaultLocale(astro)
  const locales = getLocales(astro)
  const localeCodes = locales.map(l => l.code)

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
      if (path) {
        return getRouteName(path, localeCodes)
      }
      return getRouteName(astro.url.pathname, localeCodes)
    },
    getLocaleFromPath: (path?: string): string => {
      if (path) {
        return getLocaleFromPath(path, defaultLocale, localeCodes)
      }
      return getLocaleFromPath(astro.url.pathname, defaultLocale, localeCodes)
    },

    // Path utilities
    switchLocalePath: (newLocale: string): string => {
      return switchLocalePath(astro.url.pathname, newLocale, localeCodes, defaultLocale)
    },
    localizePath: (path: string, targetLocale?: string): string => {
      return localizePath(path, targetLocale || locale, localeCodes, defaultLocale)
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
  const {
    baseUrl = '/',
    addDirAttribute = true,
    addSeoAttributes = true,
  } = options

  const locale = getLocale(astro)
  const defaultLocale = getDefaultLocale(astro)
  const locales = getLocales(astro)
  const currentLocaleObj = locales.find(l => l.code === locale)

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

  // Alternate languages
  for (const loc of locales) {
    if (loc.code === locale) continue

    const alternatePath = switchLocalePath(astro.url.pathname, loc.code, locales.map(l => l.code), defaultLocale)
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
