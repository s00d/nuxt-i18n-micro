import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale, LocaleCode } from 'nuxt-i18n-micro-types'

export function extractLocaleRoutes(content: string, filePath: string): Record<string, string> | null {
  // Ищем вызов defineI18nRoute (с долларом или без)
  const defineMatch = content.match(/\$?\bdefineI18nRoute\s*\(\s*\{[\s\S]*?\}\s*\)/)
  if (defineMatch) {
    // Ищем блок localeRoutes внутри вызова defineI18nRoute
    const localeRoutesMatch = defineMatch[0].match(/localeRoutes:\s*(\{[\s\S]*?\})/)

    if (localeRoutesMatch && localeRoutesMatch[1]) {
      try {
        // Парсим найденный блок localeRoutes
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
