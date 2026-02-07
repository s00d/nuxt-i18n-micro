import type { Locale } from '@i18n-micro/types'
import type { MiddlewareHandler } from 'astro'
import type { AstroI18n } from './composer'
import { getGlobalRoutingStrategy } from './integration'
import type { I18nRoutingStrategy } from './router/types'
// Import shim to ensure App.Locals is available
import './env.d'

export interface I18nMiddlewareOptions {
  i18n: AstroI18n
  defaultLocale: string
  locales: string[]
  localeObjects?: Locale[]
  autoDetect?: boolean
  redirectToDefault?: boolean
  routingStrategy?: I18nRoutingStrategy
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
    routingStrategy,
  } = options

  // Get routing strategy from options or global context
  const strategy = routingStrategy || getGlobalRoutingStrategy()

  return async (context, next) => {
    // FIX: If locale is already preserved in locals (e.g. during Astro.rewrite),
    // skip redetection to prevent overwriting with default locale.
    if (context.locals.locale && context.locals.i18n) {
      return next()
    }

    const url = context.url
    const pathname = url.pathname

    // If no routing strategy, use basic fallback
    if (!strategy) {
      // Basic fallback: just set route name from path
      const requestI18n = globalI18n.clone(defaultLocale)
      const routeName = pathname === '/' || pathname === '' ? 'index' : pathname.split('/').filter(Boolean).join('-')
      requestI18n.setRoute(routeName)

      // @ts-expect-error private property mismatch between src and dist types
      context.locals.i18n = requestI18n
      context.locals.locale = defaultLocale
      context.locals.defaultLocale = defaultLocale
      context.locals.locales = localeObjects || locales.map((code) => ({ code }))
      context.locals.currentUrl = url

      return next()
    }

    // Create context-aware routing strategy with current URL
    const contextStrategy: I18nRoutingStrategy = {
      ...strategy,
      getCurrentPath: () => pathname,
      getRoute: () => ({
        fullPath: url.pathname + url.search,
        query: Object.fromEntries(url.searchParams),
      }),
    }

    // 1. Check if locale is in path
    const pathSegments = pathname.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]
    const hasLocalePrefix = firstSegment !== undefined && locales.includes(firstSegment)

    // 2. Determine locale
    let detectedLocale: string

    if (hasLocalePrefix && firstSegment) {
      detectedLocale = firstSegment
    } else {
      // Use routing strategy if available, otherwise fallback
      if (contextStrategy.getLocaleFromPath) {
        detectedLocale = contextStrategy.getLocaleFromPath(pathname, defaultLocale, locales)
      } else {
        detectedLocale = defaultLocale
      }
    }

    // 3. Create per-request instance sharing the cache
    const requestI18n = globalI18n.clone(detectedLocale)

    // 4. Set route name using routing strategy
    const routeName = contextStrategy.getRouteName ? contextStrategy.getRouteName(pathname, locales) : 'general'
    requestI18n.setRoute(routeName)

    // 5. Store in locals (Type-safe now thanks to astro-shim.d.ts)
    // @ts-expect-error private property mismatch between src and dist types
    context.locals.i18n = requestI18n
    context.locals.locale = detectedLocale
    context.locals.defaultLocale = defaultLocale
    context.locals.locales = localeObjects || locales.map((code) => ({ code }))
    context.locals.currentUrl = url
    context.locals.routingStrategy = contextStrategy

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
  localeCookie: string | null = 'i18n-locale',
): string {
  // Get routing strategy
  const strategy = getGlobalRoutingStrategy()

  // 1. Try path
  let locale = defaultLocale
  if (strategy?.getLocaleFromPath) {
    locale = strategy.getLocaleFromPath(pathname, defaultLocale, locales)
  } else {
    // Fallback: check if first segment is a locale
    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]
    if (firstSegment && locales.includes(firstSegment)) {
      locale = firstSegment
    }
  }

  // 2. Try cookie (skip if localeCookie is null)
  if (localeCookie !== null && locale === defaultLocale && cookies.get(localeCookie)) {
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
    } catch {
      // Headers may be unavailable in static mode
      // Fallback to default locale
    }
  }

  return locale
}
