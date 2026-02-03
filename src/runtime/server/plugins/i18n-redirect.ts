/**
 * Nitro plugin: runs on every request and handles i18n redirect/404 (no composables).
 * Replaces the old 06.redirect plugin and locale-redirect.vue logic.
 */
import { defineNitroPlugin } from 'nitropack/runtime'
import { getCookie, sendRedirect, getRequestURL, getHeader, createError } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { isInternalPath } from '@i18n-micro/route-strategy'

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

/** Path is a custom path value in globalLocaleRoutes (e.g. /kontakt for de) — valid without locale prefix (no_prefix or alias). */
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

const DEBUG = process.env.NUXT_I18N_DEBUG_REDIRECT === '1'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const i18nConfig = getI18nConfig() as ModuleOptionsExtend
    const strategy = i18nConfig.strategy!

    const url = getRequestURL(event)
    const pathname = url.pathname

    if (DEBUG) {
      console.error('[i18n-redirect] request', { pathname, strategy, configStrategy: i18nConfig.strategy })
    }

    if (strategy === 'no_prefix') {
      if (DEBUG) console.error('[i18n-redirect] exit: no_prefix')
      return
    }

    const prerenderHeader = getHeader(event, 'x-nitro-prerender')
    const userAgent = getHeader(event, 'user-agent') || ''
    if (prerenderHeader || userAgent.includes('Nitro') || !userAgent) {
      if (DEBUG) console.error('[i18n-redirect] exit: prerender/ua', { prerenderHeader: !!prerenderHeader, userAgent: userAgent?.slice(0, 30) })
      return
    }

    const validLocales = i18nConfig.locales?.map(l => l.code) || []
    const defaultLocale = i18nConfig.defaultLocale!
    const pathSegments = pathname.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]
    const hasLocalePrefix = Boolean(firstSegment && validLocales.includes(firstSegment))
    const pathWithoutLocale = hasLocalePrefix ? '/' + pathSegments.slice(1).join('/') || '/' : pathname
    const pathKey = pathWithoutLocale === '/' ? '/' : pathWithoutLocale.replace(/^\//, '')

    const globalLocaleRoutes = i18nConfig.globalLocaleRoutes
    const routeLocales = i18nConfig.routeLocales

    if (pathname.startsWith('/_nuxt/') || pathname.startsWith('/api/') || pathname.startsWith('/_locales/') || pathname.includes('.')) {
      if (DEBUG) console.error('[i18n-redirect] exit: static/api')
      return
    }

    if (isInternalPath(pathname, i18nConfig.excludePatterns)) {
      if (DEBUG) console.error('[i18n-redirect] 404: isInternalPath', pathname)
      throw createError({ statusCode: 404, statusMessage: 'Static file - should not be processed by i18n' })
    }

    if (hasLocalePrefix) {
      if (strategy === 'prefix_except_default' && pathSegments.length === 1 && firstSegment === defaultLocale) {
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
      }
      if (globalLocaleRoutes && (globalLocaleRoutes[pathWithoutLocale] === false || globalLocaleRoutes[pathKey] === false)) {
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
      }
      const allowedLocales = getAllowedLocalesForPath(pathWithoutLocale, routeLocales, validLocales)
      if (allowedLocales && allowedLocales.length > 0 && firstSegment && !allowedLocales.includes(firstSegment)) {
        if (DEBUG) console.error('[i18n-redirect] 404: locale not allowed', { pathWithoutLocale, firstSegment, allowedLocales })
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
      }
      if (DEBUG) console.error('[i18n-redirect] exit: hasLocalePrefix ok')
      return
    }

    if (strategy === 'prefix_and_default' && (pathname === '/' || pathname === '')) {
      if (DEBUG) console.error('[i18n-redirect] exit: prefix_and_default root')
      return
    }

    // Path without locale prefix that is a custom path in globalLocaleRoutes (e.g. /kontakt) is valid as-is (no_prefix strategy or alias). Do not redirect to /en/... so Nuxt can match the route.
    if (isCustomPathWithoutPrefix(pathname, globalLocaleRoutes)) {
      if (DEBUG) console.error('[i18n-redirect] exit: path is custom (no redirect)', pathname)
      return
    }

    let targetLocale: string = defaultLocale
    if (i18nConfig.localeCookie !== null) {
      const cookieLocaleName = i18nConfig.localeCookie || 'user-locale'
      const cookieValue = getCookie(event, cookieLocaleName)
      if (cookieValue && validLocales.includes(cookieValue)) {
        targetLocale = cookieValue
      }
    }

    const redirectPath = resolveLocalizedPath(
      pathname,
      targetLocale,
      strategy,
      defaultLocale,
      globalLocaleRoutes,
    )

    if (redirectPath === pathname || redirectPath === (pathname === '/' ? '/' : pathname)) {
      if (DEBUG) console.error('[i18n-redirect] exit: redirectPath same as pathname', { pathname, redirectPath })
      return
    }

    let finalPath = redirectPath
    if (url.search) {
      finalPath = finalPath + url.search
    }
    if (url.hash) {
      finalPath = finalPath + (url.hash.startsWith('#') ? url.hash : `#${url.hash}`)
    }

    if (DEBUG) console.error('[i18n-redirect] REDIRECT', { pathname, finalPath, strategy, targetLocale })
    return sendRedirect(event, finalPath, 302)
  })
})
