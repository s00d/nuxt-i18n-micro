import type { Locale } from '@i18n-micro/types'
import { localeFromPath } from '@i18n-micro/utils/resolve-locale'
import type { I18nRoutingStrategy } from './types'

/** A dynamic segment by its name: `[slug]` and `[...slug]` are `slug`, as a page dictionary's folder names them. */
const PARAM = /\[(?:\.\.\.)?([^\]]+)\]/g

function segmentsOf(path: string, locales: readonly string[]): string[] {
  const segments = path.split('/').filter(Boolean)
  if (segments[0] !== undefined && locales.includes(segments[0])) segments.shift()
  return segments
}

/** `/en/blog/post` → `blog-post`, `/blog/[slug]` → `blog-slug`, `/` → `index`. */
export function routeNameFromPath(path: string, locales: readonly string[] = []): string {
  const segments = segmentsOf(path, locales)
  return segments.length === 0 ? 'index' : segments.join('-').replace(PARAM, '$1')
}

const removeLocale = (path: string, locales: readonly string[] = []): string => `/${segmentsOf(path, locales).join('/')}`

/** `path` in `locale`: no prefix for the default locale, or for every locale when no default is given and `locale` is empty. */
function addLocale(path: string, locale: string, locales: readonly string[] = [], defaultLocale?: string): string {
  const segments = segmentsOf(path, locales)
  if (locale !== defaultLocale) segments.unshift(locale)
  return `/${segments.join('/')}`
}

/**
 * Prefix-except-default routing over plain paths. Paths here never carry Astro's `base`: the
 * middleware strips it from what comes in and adds it to what goes out.
 */
export function createAstroRouterAdapter(locales: Locale[], defaultLocale: string, getCurrentUrl?: () => URL): I18nRoutingStrategy {
  const localeCodes = locales.map((locale) => locale.code)
  const currentUrl = () => getCurrentUrl?.() ?? (typeof window !== 'undefined' ? new URL(window.location.href) : null)

  return {
    getCurrentPath: () => currentUrl()?.pathname ?? '/',
    // the pattern names one route for every URL it matches: `/blog/hello` is `blog-slug`
    getRouteName: (path, codes = [], pattern) => routeNameFromPath(pattern ?? path, codes),
    getLocaleFromPath: (path, fallback = 'en', codes = []) => localeFromPath(`/${path.replace(/^\/+/, '')}`, codes) ?? fallback,
    switchLocalePath: addLocale,
    localizePath: addLocale,
    removeLocaleFromPath: removeLocale,
    resolvePath: (to, locale) => addLocale(typeof to === 'string' ? to : to.path || '/', locale, localeCodes, defaultLocale),
    getRoute: () => {
      const url = currentUrl()
      return url ? { fullPath: url.pathname + url.search, query: Object.fromEntries(url.searchParams) } : { fullPath: '/', query: {} }
    },
    push: (target) => {
      if (typeof window !== 'undefined') window.location.href = target.path
    },
    replace: (target) => {
      if (typeof window !== 'undefined') window.location.replace(target.path)
    },
  }
}
