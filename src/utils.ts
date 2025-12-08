import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { Locale, DefineI18nRouteConfig } from '@i18n-micro/types'

// Helper function to extract script content from Vue file
function extractScriptContent(content: string): string | null {
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  return scriptMatch && scriptMatch[1] ? scriptMatch[1] : null
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

    // Normalize locales: if it's an object with path properties, convert to array and extract paths to localeRoutes
    if (configObject.locales && typeof configObject.locales === 'object' && !Array.isArray(configObject.locales)) {
      const localesObj = configObject.locales as Record<string, Record<string, unknown> & { path?: string }>
      const normalizedLocales: string[] = []
      const normalizedLocaleRoutes: Record<string, string> = {}

      for (const [locale, value] of Object.entries(localesObj)) {
        normalizedLocales.push(locale)
        if (value && typeof value === 'object' && 'path' in value && typeof value.path === 'string') {
          normalizedLocaleRoutes[locale] = value.path
        }
      }

      return {
        ...configObject,
        locales: normalizedLocales,
        localeRoutes: configObject.localeRoutes || Object.keys(normalizedLocaleRoutes).length > 0 ? { ...configObject.localeRoutes, ...normalizedLocaleRoutes } : undefined,
      }
    }

    // Handle array of objects: extract code property if present
    if (Array.isArray(configObject.locales) && configObject.locales.length > 0 && typeof configObject.locales[0] === 'object') {
      const normalizedLocales: string[] = configObject.locales.map((item: unknown) => {
        if (item && typeof item === 'object' && 'code' in item) {
          return (item as { code: string }).code
        }
        return String(item)
      })

      return {
        ...configObject,
        locales: normalizedLocales,
      }
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

export function normalizeRouteKey(key: string): string {
  return key
    .split('/')
    .map((segment) => {
      if (segment.startsWith('[...') && segment.endsWith(']')) {
        // Случай [...slug] -> :slug(.*)*
        const paramName = segment.substring(4, segment.length - 1)
        return `:${paramName}(.*)*`
      }
      if (segment.startsWith('[') && segment.endsWith(']')) {
        // Случай [id] -> :id
        const paramName = segment.substring(1, segment.length - 1)
        return `:${paramName}`
      }
      return segment
    })
    .join('/')
}

export function denormalizeRouteKey(key: string): string {
  // Если ключ - это просто корень, возвращаем его сразу.
  if (key === '/') {
    return key
  }

  return key
    .split('/') // 1. Разбиваем путь на части: ['', 'product', ':slug(.*)*']
    .map((segment) => { // 2. Преобразуем каждую часть
      // Сначала проверяем самый специфичный случай: :slug(.*)*
      if (segment.startsWith(':') && segment.endsWith('(.*)*')) {
        // Вырезаем имя параметра 'slug'
        const paramName = segment.substring(1, segment.length - 6)
        return `[...${paramName}]` // Собираем обратно в [...slug]
      }

      // Затем проверяем случай с необязательным параметром: :id()
      if (segment.startsWith(':') && segment.endsWith('()')) {
        // Вырезаем имя параметра 'id'
        const paramName = segment.substring(1, segment.length - 2)
        return `[${paramName}]` // Собираем обратно в [id]
      }

      // Наконец, проверяем общий случай для любого динамического параметра: :id
      // Этот блок сработает для :id, но не сработает для :slug(.*)*, так как тот уже был обработан выше.
      if (segment.startsWith(':')) {
        // Вырезаем имя параметра 'id'
        const paramName = segment.substring(1)
        return `[${paramName}]` // Собираем обратно в [id]
      }

      // Если это обычная часть пути, оставляем её без изменений
      return segment
    })
    .join('/') // 3. Собираем путь обратно в единую строку
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
