import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { DefineI18nRouteConfig, Locale } from './types'

function normalizeLocales(localesArray: string[]): Record<string, object> {
  const localesObject: Record<string, object> = {}
  for (const locale of localesArray) {
    localesObject[locale] = {} // Присваиваем пустой объект как значение для каждого ключа
  }
  return localesObject
}

export function extractDefineI18nRouteConfig(content: string, filePath: string): DefineI18nRouteConfig | null {
  const match = content.match(/^[ \t]*\$defineI18nRoute\((\{[\s\S]*?\})\)/m)
  if (match && match[1]) {
    try {
      const parsedObject = Function('"use strict";return (' + match[1] + ')')()

      // Добавляем нормализацию массивов в объекты
      if (parsedObject.locales && Array.isArray(parsedObject.locales)) {
        parsedObject.locales = normalizeLocales(parsedObject.locales)
      }

      if (validateDefineI18nRouteConfig(parsedObject)) {
        return parsedObject
      }
      else {
        console.error('Invalid defineI18nRoute configuration format:', parsedObject, 'in file: ', filePath)
      }
    }
    catch (error) {
      console.error('Failed to parse defineI18nRoute configuration:', error, 'in file: ', filePath)
    }
  }
  return null
}

export function validateDefineI18nRouteConfig(obj: DefineI18nRouteConfig): boolean {
  if (typeof obj !== 'object' || obj === null) return false
  if (obj.locales) {
    if (typeof obj.locales !== 'object') return false
    for (const localeKey in obj.locales) {
      const translations = obj.locales[localeKey]
      if (typeof translations !== 'object' || translations === null) return false
    }
  }
  if (obj.localeRoutes) {
    if (typeof obj.localeRoutes !== 'object') return false
    for (const routeKey in obj.localeRoutes) {
      if (typeof obj.localeRoutes[routeKey] !== 'string') return false
    }
  }
  return true
}

export const normalizePath = (routePath: string): string => path.posix.join(path.posix.normalize(routePath).replace(/\/+$/, ''))

export const cloneArray = <T>(array: T[]): T[] => [...array]

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

export const buildFullPath = (locale: string | string[], basePath: string): string => {
  const localeParam = Array.isArray(locale) ? locale.join('|') : locale
  return normalizePath(path.posix.join('/', `:locale(${localeParam})`, basePath))
}
