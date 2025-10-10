import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale, DefineI18nRouteConfig } from 'nuxt-i18n-micro-types'

// Helper function to extract script content from Vue file
function extractScriptContent(content: string): string | null {
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  return scriptMatch ? scriptMatch[1] : null
}

// Helper function to remove TypeScript types from function parameters
function removeTypeScriptTypes(scriptContent: string): string {
  // Remove type annotations from function parameters: (param: type) -> (param)
  // Only match patterns inside parentheses with word characters before the colon
  return scriptContent.replace(/\((\w+):[^)]*\)/g, '($1)')
}

// Helper function to find defineI18nRoute call and extract config using Function()
function findDefineI18nRouteConfig(scriptContent: string): DefineI18nRouteConfig | null {
  try {
    // Find the defineI18nRoute call - use proper brace counting
    const defineStart = scriptContent.indexOf('$defineI18nRoute(')
    if (defineStart === -1) {
      return null
    }

    const openParen = scriptContent.indexOf('(', defineStart)
    if (openParen === -1) {
      return null
    }

    // Find the matching closing paren using brace counting
    let braceCount = 0
    let parenCount = 1 // Start with 1 because we found the opening paren
    let i = openParen + 1

    for (; i < scriptContent.length; i++) {
      if (scriptContent[i] === '{') braceCount++
      if (scriptContent[i] === '}') braceCount--
      if (scriptContent[i] === '(') parenCount++
      if (scriptContent[i] === ')') {
        parenCount--
        if (parenCount === 0 && braceCount === 0) break
      }
    }

    if (i >= scriptContent.length) {
      return null
    }

    const configStr = scriptContent.substring(openParen + 1, i)

    try {
      // Try to execute only the config object directly first
      const cleanConfigStr = removeTypeScriptTypes(configStr)

      try {
        // Try to execute only the config object directly
        const configObject = Function('"use strict";return (' + cleanConfigStr + ')')()

        // Use JSON.stringify to serialize and then JSON.parse to deserialize
        // This will remove functions and other non-serializable values
        try {
          const serialized = JSON.stringify(configObject)
          return JSON.parse(serialized)
        }
        catch {
          // If JSON.stringify fails, return the object as is
          return configObject
        }
      }
      catch {
        // If direct execution fails, try with mocked functions but skip imports
        const scriptWithoutImports = scriptContent
          .split('\n')
          .filter(line => !line.trim().startsWith('import '))
          .join('\n')

        const cleanScript = removeTypeScriptTypes(scriptWithoutImports)

        const safeScript = `
          // Mock $defineI18nRoute to prevent errors
          const $defineI18nRoute = () => {}
          const defineI18nRoute = () => {}

          // Mock process.env for conditional logic
          const process = { env: { NODE_ENV: 'development' } }

          // Execute the script content without imports and TypeScript types
          ${cleanScript}

          // Return the config object
          return (${cleanConfigStr})
        `

        const configObject = Function('"use strict";' + safeScript)()

        // Use JSON.stringify to serialize and then JSON.parse to deserialize
        // This will remove functions and other non-serializable values
        try {
          const serialized = JSON.stringify(configObject)
          return JSON.parse(serialized)
        }
        catch {
          // If JSON.stringify fails, return the object as is
          return configObject
        }
      }
    }
    catch {
      return null
    }
  }
  catch {
    return null
  }
}

export function extractDefineI18nRouteData(content: string, _filePath: string): DefineI18nRouteConfig | null {
  try {
    const scriptContent = extractScriptContent(content)
    if (!scriptContent) {
      return null
    }

    // Try to find the defineI18nRoute call and extract its config
    const configObject = findDefineI18nRouteConfig(scriptContent)
    if (!configObject) {
      return null
    }

    // Return the config object directly
    return configObject
  }
  catch {
    return null
  }
}

export function validateDefineI18nRouteConfig(obj: Record<string, string>): boolean {
  if (typeof obj !== 'object') return false
  for (const routeKey in obj) {
    if (typeof obj[routeKey] !== 'string') return false
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
