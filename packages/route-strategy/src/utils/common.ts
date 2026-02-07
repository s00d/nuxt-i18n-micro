import type { Locale } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'

export const cloneArray = <T extends object>(array: T[]): T[] => array.map((item) => ({ ...item }))

export const isPageRedirectOnly = (page: NuxtPage): boolean => !!(page.redirect && !page.file)

export const buildRouteName = (baseName: string, localeCode: string, isCustom: boolean, prefix = 'localized-'): string =>
  isCustom ? `${prefix}${baseName}-${localeCode}` : `${prefix}${baseName}`

export const buildRouteNameFromRoute = (name: string | null | undefined, routePath: string | null | undefined): string =>
  name ?? (routePath ?? '').replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '')

export const shouldAddLocalePrefix = (locale: string, defaultLocale: Locale, addLocalePrefix: boolean): boolean =>
  addLocalePrefix && locale !== defaultLocale.code

export const isLocaleDefault = (locale: string | Locale, defaultLocale: Locale): boolean => {
  const localeCode = typeof locale === 'string' ? locale : locale.code
  return localeCode === defaultLocale.code
}

const DEFAULT_STATIC_PATTERNS = [
  /^\/sitemap.*\.xml$/,
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/favicon\.ico$/,
  /^\/apple-touch-icon.*\.png$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
  /^\/workbox-.*\.js$/,
  /\.(xml|txt|ico|json|js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
]

export function isInternalPath(path: string, excludePatterns?: (string | RegExp | object)[]): boolean {
  if (/(?:^|\/)__[^/]+/.test(path)) {
    return true
  }
  for (const pattern of DEFAULT_STATIC_PATTERNS) {
    if (pattern.test(path)) {
      return true
    }
  }
  if (excludePatterns) {
    for (const pattern of excludePatterns) {
      if (typeof pattern === 'string') {
        if (pattern.includes('*') || pattern.includes('?')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
          if (regex.test(path)) return true
        } else if (path === pattern || path.startsWith(pattern)) {
          return true
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(path)) return true
      }
    }
  }
  return false
}
