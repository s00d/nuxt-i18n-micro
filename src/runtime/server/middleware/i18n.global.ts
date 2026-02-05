/**
 * Nitro middleware: locale detection, redirect/404, and general translation loading.
 * Replaces i18n-redirect.ts plugin logic and adds event.context.i18n for 01.plugin.
 */
import { defineEventHandler, getCookie, setCookie, getQuery, getRequestURL, getHeader, sendRedirect, createError } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { isInternalPath } from '@i18n-micro/route-strategy'
import { getLocaleCookieName, getLocaleCookieOptions } from '../../utils/cookie'

function resolveLocalizedPath(
  pathname: string,
  localeCode: string,
  strategy: string,
  defaultLocale: string,
  globalLocaleRoutes: Record<string, Record<string, string> | boolean> | null | undefined,
): string {
  const pathKey = pathname === '/' ? '/' : pathname.replace(/^\//, '')
  const normalizedPath = pathname.replace(/^\//, '') || '/'

  let customPath: string | undefined
  const pathRules = globalLocaleRoutes?.[pathKey]
  const pathRulesNorm = globalLocaleRoutes?.[normalizedPath]
  if (pathRules && typeof pathRules === 'object' && !Array.isArray(pathRules)) {
    customPath = pathRules[localeCode]
  }
  else if (pathRulesNorm && typeof pathRulesNorm === 'object' && !Array.isArray(pathRulesNorm)) {
    customPath = pathRulesNorm[localeCode]
  }

  const basePath = customPath ? customPath.replace(/^\//, '') : pathname.replace(/^\//, '') || ''
  let shouldPrefix = false
  if (strategy === 'prefix' || strategy === 'prefix_and_default') {
    shouldPrefix = true
  }
  else if (strategy === 'prefix_except_default') {
    shouldPrefix = localeCode !== defaultLocale
  }

  if (localeCode === defaultLocale && !customPath && (strategy === 'prefix_except_default' || strategy === 'no_prefix')) {
    shouldPrefix = false
  }

  if (!shouldPrefix) {
    return basePath ? `/${basePath}` : '/'
  }
  return basePath ? `/${localeCode}/${basePath}` : `/${localeCode}`
}

function getAllowedLocalesForPath(
  pathWithoutLocale: string,
  routeLocales: Record<string, string[]> | undefined,
  localeCodes: string[],
): string[] | null {
  if (!routeLocales || Object.keys(routeLocales).length === 0) return null
  const pathKey = pathWithoutLocale === '/' ? '/' : pathWithoutLocale.replace(/^\//, '')
  const allowed = routeLocales[pathWithoutLocale] ?? routeLocales[pathKey]
  if (Array.isArray(allowed) && allowed.length > 0) {
    return allowed.filter(code => localeCodes.includes(code))
  }
  return null
}

function isCustomPathWithoutPrefix(
  pathname: string,
  globalLocaleRoutes: Record<string, Record<string, string> | boolean> | null | undefined,
): boolean {
  if (!globalLocaleRoutes || typeof globalLocaleRoutes !== 'object') return false
  const normalized = pathname === '/' ? '/' : pathname.replace(/^\//, '')
  for (const key of Object.keys(globalLocaleRoutes)) {
    const val = globalLocaleRoutes[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      for (const code of Object.keys(val)) {
        const customPath = (val as Record<string, string>)[code]
        if (customPath) {
          const norm = customPath === '/' ? '/' : customPath.replace(/^\//, '')
          if (norm === normalized) return true
        }
      }
    }
  }
  return false
}

function parseAcceptLanguage(header: string | undefined): string[] {
  if (!header) return []
  return header
    .split(',')
    .map((entry) => {
      const [lang] = entry.split(';')
      return (lang ?? '').trim()
    })
    .filter((s): s is string => s.length > 0)
}

const DEBUG = process.env.NUXT_I18N_DEBUG_REDIRECT === '1'

export default defineEventHandler(async (event) => {
  const path = event.path || getRequestURL(event).pathname

  // Fast early exits — before any i18n logic
  if (path.startsWith('/api') || path.startsWith('/_nuxt') || path.startsWith('/_locales') || path.startsWith('/__')) return
  // Static assets: .js, .css, .png etc. — skip regex/config entirely
  if (path.includes('.') && !path.endsWith('.html')) return

  const config = getI18nConfig() as ModuleOptionsExtend
  // isInternalPath (regex loop) as early as possible — before path parsing, cookies, headers
  if (isInternalPath(path, config.excludePatterns)) {
    if (DEBUG) console.error('[i18n-middleware] 404: isInternalPath', path)
    throw createError({ statusCode: 404, statusMessage: 'Static file - should not be processed by i18n' })
  }

  const validLocales = config.locales?.map(l => l.code) || []
  const defaultLocale = config.defaultLocale || 'en'
  const strategy = config.strategy!

  const prerenderHeader = getHeader(event, 'x-nitro-prerender')
  const userAgent = getHeader(event, 'user-agent') || ''
  // For / with prefix strategy: always redirect to default locale (even during prerender)
  // so index.html is generated as redirect for static hosting
  const isRootPath = path === '/' || path === ''
  const skipRedirect = isRootPath && (strategy === 'prefix' || strategy === 'prefix_and_default')
    ? false
    : !!(prerenderHeader || userAgent.includes('Nitro') || !userAgent)

  const pathSegments = path.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  const customRegex = config.customRegexMatcher
  // Unknown locale: first segment matches locale pattern (entire segment) but is not in validLocales → 404
  if (firstSegment && customRegex && !validLocales.includes(firstSegment)) {
    const source = typeof customRegex === 'string' ? customRegex : customRegex.source
    const regex = new RegExp(`^${source}$`)
    if (regex.test(firstSegment)) {
      if (DEBUG) console.error('[i18n-middleware] 404: unknown locale', firstSegment)
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }
  }
  const hasLocaleInUrl = Boolean(firstSegment && validLocales.includes(firstSegment))
  const pathWithoutLocale = hasLocaleInUrl ? '/' + pathSegments.slice(1).join('/') || '/' : path
  const pathKey = pathWithoutLocale === '/' ? '/' : pathWithoutLocale.replace(/^\//, '')
  const globalLocaleRoutes = config.globalLocaleRoutes
  const routeLocales = config.routeLocales

  let locale = defaultLocale
  let detectedFromAcceptLanguage: string | null = null

  // Detect locale from Accept-Language first (for autoDetectLanguage redirect)
  if (config.autoDetectLanguage) {
    const acceptHeader = getHeader(event, 'accept-language')
    const langs = parseAcceptLanguage(acceptHeader)
    for (const lang of langs) {
      const lowerCaseLanguage = lang.toLowerCase()
      const primaryLanguage = lowerCaseLanguage.split('-')[0]
      const found = validLocales.find(l => l.toLowerCase() === lowerCaseLanguage || l.toLowerCase() === primaryLanguage)
      if (found) {
        detectedFromAcceptLanguage = found
        break
      }
    }
  }

  if (hasLocaleInUrl) {
    locale = firstSegment!
  }
  else if (getQuery(event).locale && validLocales.includes(String(getQuery(event).locale))) {
    locale = String(getQuery(event).locale)
  }
  else {
    const cookieName = getLocaleCookieName(config)
    if (cookieName) {
      const cookieVal = getCookie(event, cookieName)
      if (cookieVal && validLocales.includes(cookieVal)) locale = cookieVal
    }
  }

  // Apply Accept-Language detection if no explicit locale found
  if (locale === defaultLocale && detectedFromAcceptLanguage) {
    locale = detectedFromAcceptLanguage
  }

  // autoDetectLanguage redirect: URL has locale but Accept-Language prefers different one
  // Only redirect if autoDetectPath matches current path (compare with original path, not pathWithoutLocale)
  const autoDetectPath = config.autoDetectPath ?? '/'
  const shouldAutoDetectRedirect = autoDetectPath === '*' || path === autoDetectPath || path === `${autoDetectPath}/`
  if (!skipRedirect && config.autoDetectLanguage && hasLocaleInUrl && detectedFromAcceptLanguage && firstSegment !== detectedFromAcceptLanguage && shouldAutoDetectRedirect) {
    const redirectPath = resolveLocalizedPath(pathWithoutLocale, detectedFromAcceptLanguage, strategy, defaultLocale, globalLocaleRoutes)
    const url = getRequestURL(event)
    let finalPath = redirectPath
    if (url.search) finalPath += url.search
    if (url.hash) finalPath += (url.hash.startsWith('#') ? url.hash : `#${url.hash}`)
    if (DEBUG) console.error('[i18n-middleware] REDIRECT autoDetect', { path, finalPath, detectedFromAcceptLanguage })
    return sendRedirect(event, finalPath, 302)
  }

  if (!skipRedirect && strategy !== 'no_prefix') {
    if (hasLocaleInUrl) {
      if (strategy === 'prefix_except_default' && pathSegments.length === 1 && firstSegment === defaultLocale) {
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
      }
      if (globalLocaleRoutes && (globalLocaleRoutes[pathWithoutLocale] === false || globalLocaleRoutes[pathKey] === false)) {
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
      }
      const allowedLocales = getAllowedLocalesForPath(pathWithoutLocale, routeLocales, validLocales)
      if (allowedLocales && allowedLocales.length > 0 && firstSegment && !allowedLocales.includes(firstSegment)) {
        if (DEBUG) console.error('[i18n-middleware] 404: locale not allowed', { pathWithoutLocale, firstSegment, allowedLocales })
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
      }

      // prefix_except_default: redirect /de or /ru (locale root only) to / when localeCookie enabled and user prefers default
      // Only when cookies are enabled — otherwise respect URL (user navigated to /de explicitly)
      const cookieName = getLocaleCookieName(config)
      if (cookieName && strategy === 'prefix_except_default' && firstSegment !== defaultLocale && (pathWithoutLocale === '/' || pathWithoutLocale === '')) {
        let preferredLocale = defaultLocale
        const cookieVal = getCookie(event, cookieName)
        if (cookieVal && validLocales.includes(cookieVal)) preferredLocale = cookieVal
        if (preferredLocale === defaultLocale) {
          const redirectPath = resolveLocalizedPath(pathWithoutLocale, defaultLocale, strategy, defaultLocale, globalLocaleRoutes)
          const url = getRequestURL(event)
          let finalPath = redirectPath
          if (url.search) finalPath += url.search
          if (url.hash) finalPath += (url.hash.startsWith('#') ? url.hash : `#${url.hash}`)
          const { watch: _w, ...cookieOpts } = getLocaleCookieOptions()
          setCookie(event, cookieName, defaultLocale, cookieOpts)
          if (DEBUG) console.error('[i18n-middleware] REDIRECT to default (no cookie)', { path, finalPath })
          return sendRedirect(event, finalPath, 302)
        }
      }
    }
    else if (strategy === 'prefix_and_default' && (path === '/' || path === '')) {
      // No redirect for root
    }
    else if (globalLocaleRoutes && (globalLocaleRoutes[pathKey] === false || globalLocaleRoutes[pathWithoutLocale] === false)) {
      // Unlocalized route: never redirect to add locale prefix, serve path as-is
    }
    else if (!isCustomPathWithoutPrefix(path, globalLocaleRoutes)) {
      let targetLocale = defaultLocale
      const cookieName = getLocaleCookieName(config)
      if (cookieName) {
        const cookieVal = getCookie(event, cookieName)
        if (cookieVal && validLocales.includes(cookieVal)) targetLocale = cookieVal
      }

      const redirectPath = resolveLocalizedPath(path, targetLocale, strategy, defaultLocale, globalLocaleRoutes)
      if (redirectPath !== path && redirectPath !== (path === '/' ? '/' : path)) {
        const url = getRequestURL(event)
        let finalPath = redirectPath
        if (url.search) finalPath += url.search
        if (url.hash) finalPath += (url.hash.startsWith('#') ? url.hash : `#${url.hash}`)
        if (DEBUG) console.error('[i18n-middleware] REDIRECT', { path, finalPath, strategy, targetLocale })
        return sendRedirect(event, finalPath, 302)
      }
    }
  }

  event.context.i18n = {
    locale,
    translations: {}, // Данные загружает плагин через API (server/routes/i18n.ts)
  }

  // Синхронизация cookie с определённой локалью — единый источник правды на сервере
  const cookieName = getLocaleCookieName(config)
  const currentCookie = cookieName ? getCookie(event, cookieName) : undefined
  if (cookieName && validLocales.includes(locale) && currentCookie !== locale) {
    const { watch: _w, ...cookieOpts } = getLocaleCookieOptions()
    setCookie(event, cookieName, locale, cookieOpts)
  }
})
