import type { Locale } from '@i18n-micro/types'
import { localeFromPath } from '@i18n-micro/utils/resolve-locale'
import type { I18nRoutingStrategy } from './types'

/** Route name of an Astro path, without its locale prefix: `/en/blog/post` → `blog-post`, `/` → `index`. */
export function routeNameFromPath(path: string, locales: string[] = []): string {
  const segments = path.split('/').filter(Boolean)
  if (segments[0] !== undefined && locales.includes(segments[0])) segments.shift()
  return segments.length === 0 ? 'index' : segments.join('-')
}

/**
 * Factory for Astro router adapter
 * Implements routing utilities for Astro file-based routing
 * Uses standard Astro APIs: Astro.url, context.url
 */
export function createAstroRouterAdapter(locales: Locale[], defaultLocale: string, getCurrentUrl?: () => URL): I18nRoutingStrategy {
  const localeCodes = locales.map((loc) => loc.code)

  /**
   * Get route name from Astro path
   * Extracts route name from path (e.g., /en/about -> about)
   */
  const getRouteName = routeNameFromPath

  /**
   * Get locale from path
   * Checks if first segment is a locale code
   */
  const getLocaleFromPath = (path: string, defaultLocale: string = 'en', locales: string[] = []): string =>
    localeFromPath(path, locales) ?? defaultLocale

  /**
   * Switch locale in path
   * Replaces or adds locale prefix to path
   */
  const switchLocalePath = (path: string, newLocale: string, locales: string[] = [], defaultLocale?: string): string => {
    const segments = path.split('/').filter(Boolean)

    // Remove existing locale if present
    const firstSegment = segments[0]
    if (firstSegment && locales.includes(firstSegment)) {
      segments.shift()
    }

    // Add new locale if not default or if default should be included
    if (newLocale !== defaultLocale || defaultLocale === undefined) {
      segments.unshift(newLocale)
    }

    return `/${segments.join('/')}`
  }

  /**
   * Localize path with locale prefix
   */
  const localizePath = (path: string, locale: string, locales: string[] = [], defaultLocale?: string): string => {
    const cleanPath = path.replace(/^\//, '').replace(/\/$/, '') || ''
    const segments = cleanPath.split('/').filter(Boolean)

    // Remove existing locale if present
    const firstSegment = segments[0]
    if (firstSegment && locales.includes(firstSegment)) {
      segments.shift()
    }

    // Add locale if not default or if defaultLocale should be included
    if (locale !== defaultLocale || defaultLocale === undefined) {
      segments.unshift(locale)
    }

    return `/${segments.join('/')}`
  }

  /**
   * Remove locale from path
   */
  const removeLocaleFromPath = (path: string, locales: string[] = []): string => {
    const segments = path.split('/').filter(Boolean)
    const firstSegment = segments[0]
    if (firstSegment && locales.includes(firstSegment)) {
      segments.shift()
    }
    return `/${segments.join('/')}`
  }

  /**
   * Resolve path for specific locale
   */
  const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
    const path = typeof to === 'string' ? to : to.path || '/'
    return localizePath(path, locale, localeCodes, defaultLocale)
  }

  return {
    getCurrentPath: () => {
      // Use provided URL getter (from Astro.url or context.url)
      if (getCurrentUrl) {
        return getCurrentUrl().pathname
      }
      // Fallback for client-side islands
      if (typeof window !== 'undefined') {
        return window.location.pathname
      }
      return '/'
    },
    getRouteName,
    getLocaleFromPath,
    switchLocalePath,
    localizePath,
    removeLocaleFromPath,
    resolvePath,
    getRoute: () => {
      // Use provided URL getter (from Astro.url or context.url)
      if (getCurrentUrl) {
        const url = getCurrentUrl()
        return {
          fullPath: url.pathname + url.search,
          query: Object.fromEntries(url.searchParams),
        }
      }
      // Fallback for client-side islands
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        return {
          fullPath: url.pathname + url.search,
          query: Object.fromEntries(url.searchParams),
        }
      }
      return {
        fullPath: '/',
        query: {},
      }
    },
    // Optional: client-side navigation for islands
    push: (target: { path: string }) => {
      if (typeof window !== 'undefined') {
        window.location.href = target.path
      }
    },
    replace: (target: { path: string }) => {
      if (typeof window !== 'undefined') {
        window.location.replace(target.path)
      }
    },
  }
}
