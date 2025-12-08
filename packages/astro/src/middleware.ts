import type { AstroI18n } from './composer'
import { getLocaleFromPath, getRouteName } from './routing'
import type { MiddlewareHandler } from 'astro'
import type { Locale } from '@i18n-micro/types'
// Import shim to ensure App.Locals is available
import './env.d'

export interface I18nMiddlewareOptions {
  i18n: AstroI18n
  defaultLocale: string
  locales: string[]
  localeObjects?: Locale[]
  autoDetect?: boolean
  redirectToDefault?: boolean
}

/**
 * Create Astro middleware for i18n locale detection
 */
export function createI18nMiddleware(options: I18nMiddlewareOptions): MiddlewareHandler {
  const {
    i18n: globalI18n, // Это глобальный синглтон с кэшем
    defaultLocale,
    locales,
    localeObjects,
    autoDetect: _autoDetect = true,
    redirectToDefault: _redirectToDefault = false,
  } = options

  return async (context, next) => {
    // FIX: If locale is already preserved in locals (e.g. during Astro.rewrite),
    // skip redetection to prevent overwriting with default locale.
    if (context.locals.locale && context.locals.i18n) {
      return next()
    }

    const url = context.url
    const pathname = url.pathname

    // 1. Check if locale is in path
    const pathSegments = pathname.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]
    const hasLocalePrefix = firstSegment !== undefined && locales.includes(firstSegment)

    // 2. Determine locale
    let detectedLocale: string

    if (hasLocalePrefix && firstSegment) {
      detectedLocale = firstSegment
    }
    else {
      // TODO: Add auto-detect logic here if needed
      detectedLocale = defaultLocale
    }

    // 3. Create per-request instance sharing the cache
    const requestI18n = globalI18n.clone(detectedLocale)

    // 4. Set route name
    const routeName = getRouteName(pathname, locales)
    requestI18n.setRoute(routeName)

    // 5. Store in locals (Type-safe now thanks to astro-shim.d.ts)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context.locals.i18n = requestI18n
    context.locals.locale = detectedLocale
    context.locals.defaultLocale = defaultLocale
    context.locals.locales = localeObjects || locales.map(code => ({ code }))
    context.locals.currentUrl = url

    return next()
  }
}

/**
 * Parse Accept-Language header
 */
function parseAcceptLanguage(acceptLanguage: string): string[] {
  const languages: string[] = []
  const parts = acceptLanguage.split(',')

  for (const part of parts) {
    const [lang, q = '1.0'] = part.trim().split(';q=')
    const quality = Number.parseFloat(q)
    if (quality > 0 && lang) {
      // Extract base language (e.g., 'en-US' -> 'en')
      const baseLang = lang.split('-')[0]?.toLowerCase()
      if (baseLang) {
        languages.push(baseLang)
        // Also add full locale if different
        if (lang !== baseLang) {
          languages.push(lang.toLowerCase())
        }
      }
    }
  }

  return languages
}

/**
 * Detect locale from request
 */
export function detectLocale(
  pathname: string,
  cookies: { get: (name: string) => { value: string } | undefined },
  headers: Headers,
  defaultLocale: string,
  locales: string[],
  localeCookie: string = 'i18n-locale',
): string {
  // 1. Try path
  let locale = getLocaleFromPath(pathname, defaultLocale, locales)

  // 2. Try cookie
  if (locale === defaultLocale && cookies.get(localeCookie)) {
    const cookieLocale = cookies.get(localeCookie)?.value
    if (cookieLocale && locales.includes(cookieLocale)) {
      locale = cookieLocale
    }
  }

  // 3. Try Accept-Language
  if (locale === defaultLocale) {
    try {
      const acceptLanguage = headers.get('accept-language')
      if (acceptLanguage) {
        const preferredLocales = parseAcceptLanguage(acceptLanguage)
        for (const preferred of preferredLocales) {
          if (locales.includes(preferred)) {
            locale = preferred
            break
          }
        }
      }
    }
    catch {
      // Headers may be unavailable in static mode
      // Fallback to default locale
    }
  }

  return locale
}
