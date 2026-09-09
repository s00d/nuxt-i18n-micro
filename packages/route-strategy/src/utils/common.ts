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

const INTERNAL_PREFIXES = ['/api', '/_nuxt', '/_locales'] as const

const STATIC_ASSET_EXT = /\.(xml|txt|ico|json|js|css|png|jpg|jpeg|gif|svg|webp|avif|pdf|wasm|map|mp4|webm|mp3|zip|gz|woff|woff2|ttf|eot)$/i

const DEFAULT_STATIC_PATTERNS = [
  /^\/sitemap.*\.xml$/,
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/favicon\.ico$/,
  /^\/apple-touch-icon.*\.png$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
  /^\/workbox-.*\.js$/,
]

function isStaticAssetPath(path: string): boolean {
  // Last non-empty segment — trailing slashes must not defeat the extension check.
  const last = path.split('/').filter(Boolean).pop() ?? ''
  if (!last || last.endsWith('.html') || last.endsWith('.htm')) return false
  return STATIC_ASSET_EXT.test(last)
}

export function isInternalPath(path: string, excludePatterns?: (string | RegExp | object)[]): boolean {
  for (const prefix of INTERNAL_PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return true
  }
  // `/__`, `/__/…`, `/__nuxt…`, and nested `/en/__nuxt_content`
  if (/(?:^|\/)__/.test(path)) {
    return true
  }
  const pathForMatch = path.length > 1 ? path.replace(/\/+$/, '') : path
  for (const pattern of DEFAULT_STATIC_PATTERNS) {
    if (pattern.test(pathForMatch)) {
      return true
    }
  }
  if (isStaticAssetPath(path)) {
    return true
  }
  if (excludePatterns) {
    for (const pattern of excludePatterns) {
      if (typeof pattern === 'string') {
        if (pattern.includes('*') || pattern.includes('?')) {
          // Escape regex metacharacters first so `[`, `(`, etc. match literally;
          // only `*` / `?` remain as wildcards.
          const regex = new RegExp(
            pattern
              .replace(/[.+^${}()|[\]\\]/g, '\\$&')
              .replace(/\*/g, '.*')
              .replace(/\?/g, '.'),
          )
          if (regex.test(path)) return true
        } else if (path === pattern || path.startsWith(pattern)) {
          return true
        }
      } else if (pattern instanceof RegExp) {
        // Global/sticky regexes keep lastIndex across calls — reset so each path
        // is tested from the start (otherwise matches alternate true/false).
        pattern.lastIndex = 0
        const matches = pattern.test(path)
        pattern.lastIndex = 0
        if (matches) return true
      }
    }
  }
  return false
}
