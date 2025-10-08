import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale, LocaleCode } from 'nuxt-i18n-micro-types'

export interface DefineI18nRouteData {
  locales: string[] | null
  localeRoutes: Record<string, string> | null
}

export function extractDefineI18nRouteData(content: string, filePath: string): DefineI18nRouteData {
  // Look for defineI18nRoute call (with or without dollar sign)
  const defineMatch = content.match(/\$?\bdefineI18nRoute\s*\(\s*\{[\s\S]*?\}\s*\)/)

  if (!defineMatch) {
    return { locales: null, localeRoutes: null }
  }

  const defineContent = defineMatch[0]
  let locales: string[] | null = null
  let localeRoutes: Record<string, string> | null = null

  // Extract locales
  let localesStr = ''
  const localesStart = defineContent.indexOf('locales:')
  if (localesStart !== -1) {
    const afterLocales = defineContent.substring(localesStart + 8) // 8 = length of 'locales:'
    const trimmed = afterLocales.trim()
    if (trimmed.startsWith('[')) {
      // Array format
      let bracketCount = 0
      let i = 0
      for (; i < trimmed.length; i++) {
        if (trimmed[i] === '[') bracketCount++
        if (trimmed[i] === ']') bracketCount--
        if (bracketCount === 0) break
      }
      localesStr = trimmed.substring(0, i + 1)
    }
    else if (trimmed.startsWith('{')) {
      // Object format
      let braceCount = 0
      let i = 0
      for (; i < trimmed.length; i++) {
        if (trimmed[i] === '{') braceCount++
        if (trimmed[i] === '}') braceCount--
        if (braceCount === 0) break
      }
      localesStr = trimmed.substring(0, i + 1)
    }
  }

  if (localesStr) {
    try {
      const localesStrTrimmed = localesStr.trim()

      // Handle array format: ['en', 'de']
      if (localesStrTrimmed.startsWith('[') && localesStrTrimmed.endsWith(']')) {
        const arrayMatch = localesStrTrimmed.match(/\[(.*?)\]/s)
        if (arrayMatch && arrayMatch[1]) {
          locales = arrayMatch[1]
            .split(',')
            .map(el => el.trim().replace(/['"]/g, ''))
            .filter(el => el.length > 0)
        }
      }

      // Handle object format: { en: {...}, de: {...} }
      if (localesStrTrimmed.startsWith('{') && localesStrTrimmed.endsWith('}')) {
        // Extract only top-level keys (locale codes) from the object
        // Handle both ['en-us']: and 'en-us': formats
        const topLevelKeyMatches = localesStrTrimmed.match(/^\s*(\[?['"]?([\w-]+)['"]?\]?)\s*:\s*\{/gm)

        if (topLevelKeyMatches) {
          locales = topLevelKeyMatches.map((match) => {
            const keyMatch = match.match(/^\s*\[?['"]?([\w-]+)['"]?\]?\s*:/)
            return keyMatch ? keyMatch[1] : ''
          }).filter(key => key.length > 0)
        }
        else {
          // Fallback: try to extract keys by looking for patterns like "en: {" or "['en-us']: {"
          const fallbackMatches = localesStrTrimmed.match(/(\[?['"]?([\w-]+)['"]?\]?)\s*:\s*\{/g)
          if (fallbackMatches) {
            locales = fallbackMatches.map((match) => {
              const keyMatch = match.match(/(\[?['"]?([\w-]+)['"]?\]?)\s*:/)
              return keyMatch ? keyMatch[1] : ''
            }).filter(key => key.length > 0)
          }
        }
      }
    }
    catch (error) {
      console.error('Failed to parse locales:', error, 'in file:', filePath)
    }
  }

  // Extract localeRoutes
  const localeRoutesMatch = defineContent.match(/localeRoutes:\s*(\{[\s\S]*?\})/)
  if (localeRoutesMatch && localeRoutesMatch[1]) {
    try {
      const parsedLocaleRoutes = Function('"use strict";return (' + localeRoutesMatch[1] + ')')()
      if (typeof parsedLocaleRoutes === 'object' && parsedLocaleRoutes !== null) {
        if (validateDefineI18nRouteConfig(parsedLocaleRoutes)) {
          localeRoutes = parsedLocaleRoutes
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

  return { locales, localeRoutes }
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
