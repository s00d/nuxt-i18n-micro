import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale, LocaleCode } from 'nuxt-i18n-micro-types'

/**
 * Default patterns for static files that should be excluded from i18n routing
 */
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

/**
 * Checks if a path should be excluded from i18n routing
 * @param path - The path to check
 * @param excludePatterns - Optional custom exclusion patterns
 * @returns true if the path should be excluded
 */
export const isInternalPath = (path: string, excludePatterns?: (string | RegExp | object)[]): boolean => {
  // Check internal Nuxt paths (existing behavior)
  if (/(?:^|\/)__[^/]+/.test(path)) {
    return true
  }

  // Check default static file patterns
  for (const pattern of DEFAULT_STATIC_PATTERNS) {
    if (pattern.test(path)) {
      return true
    }
  }

  // Check custom exclusion patterns
  if (excludePatterns) {
    for (const pattern of excludePatterns) {
      if (typeof pattern === 'string') {
        // Convert string to regex if it contains wildcards or is a simple match
        if (pattern.includes('*') || pattern.includes('?')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
          if (regex.test(path)) {
            return true
          }
        }
        else if (path === pattern || path.startsWith(pattern)) {
          return true
        }
      }
      else if (pattern instanceof RegExp) {
        if (pattern.test(path)) {
          return true
        }
      }
      // Skip empty objects or other types
    }
  }

  return false
}

export function extractLocaleRoutes(content: string, filePath: string): Record<string, string> | null {
  // Look for defineI18nRoute call (with or without dollar sign)
  const defineMatch = content.match(/\$?\bdefineI18nRoute\s*\(\s*\{[\s\S]*?\}\s*\)/)
  if (defineMatch) {
    // Look for localeRoutes block inside defineI18nRoute call
    const localeRoutesMatch = defineMatch[0].match(/localeRoutes:\s*(\{[\s\S]*?\})/)

    if (localeRoutesMatch && localeRoutesMatch[1]) {
      try {
        // Parse the found localeRoutes block
        const parsedLocaleRoutes = Function('"use strict";return (' + localeRoutesMatch[1] + ')')()

        if (typeof parsedLocaleRoutes === 'object' && parsedLocaleRoutes !== null) {
          if (validateDefineI18nRouteConfig(parsedLocaleRoutes)) {
            return parsedLocaleRoutes
          }
        }
        else {
          console.error('localeRoutes found but it is not a valid object in file:', filePath)
        }
      }
      catch (error) {
        console.error('Failed to parse localeRoutes:', error, 'in file:', filePath)
      }
    }
  }
  return null
}

export function validateDefineI18nRouteConfig(obj: Record<LocaleCode, Record<string, string>>): boolean {
  if (typeof obj !== 'object') return false
  for (const routeKey in obj.localeRoutes) {
    if (typeof obj.localeRoutes[routeKey] !== 'string') return false
  }
  return true
}

export const normalizePath = (routePath: string): string => {
  if (!routePath) {
    return ''
  }

  const normalized = path.posix.normalize(routePath).replace(/\/+$/, '')
  return normalized === '.' ? '' : normalized
}

export const cloneArray = <T extends object>(array: T[]): T[] => array.map(item => ({ ...item }))

export const isPageRedirectOnly = (page: NuxtPage): boolean => !!(page.redirect && !page.file)

export const removeLeadingSlash = (routePath: string): string => routePath.startsWith('/') ? routePath.slice(1) : routePath

export const buildRouteName = (baseName: string, localeCode: string, isCustom: boolean): string =>
  isCustom ? `localized-${baseName}-${localeCode}` : `localized-${baseName}`

export const shouldAddLocalePrefix = (locale: string, defaultLocale: Locale, addLocalePrefix: boolean, includeDefaultLocaleRoute: boolean): boolean =>
  addLocalePrefix && !(locale === defaultLocale.code && !includeDefaultLocaleRoute)

export const isLocaleDefault = (locale: string | Locale, defaultLocale: Locale, includeDefaultLocaleRoute: boolean): boolean => {
  const localeCode = typeof locale === 'string' ? locale : locale.code
  return localeCode === defaultLocale.code && !includeDefaultLocaleRoute
}

export const buildFullPath = (locale: string | string[], basePath: string, customRegex?: string | RegExp): string => {
  const regexString = normalizeRegex(customRegex?.toString())
  const localeParam = regexString ? regexString : Array.isArray(locale) ? locale.join('|') : locale
  return normalizePath(path.posix.join('/', `:locale(${localeParam})`, basePath))
}

export const buildFullPathNoPrefix = (basePath: string): string => {
  return normalizePath(basePath)
}

const normalizeRegex = (toNorm?: string): string | undefined => {
  if (typeof toNorm === 'undefined') return undefined
  return toNorm.startsWith('/') && toNorm.endsWith('/') ? toNorm?.slice(1, -1) : toNorm
}
