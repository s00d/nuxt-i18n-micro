/**
 * Universal redirect plugin for i18n routes (works on both server and client).
 * Handles locale detection, 404 checks, and redirects.
 */

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { getCookie, getHeader, getRequestURL, sendRedirect, setCookie } from 'h3'
import { createI18nStrategy, getI18nConfig } from '#build/i18n.strategy.mjs'
import { createError, defineNuxtPlugin, navigateTo, useRequestEvent, useRoute, useRouter, useState } from '#imports'
import { useI18nLocale } from '../composables/useI18nLocale'
import { getLocaleCookieName, getLocaleCookieOptions } from '../utils/cookie'

const DEBUG = process.env.NUXT_I18N_DEBUG_REDIRECT === '1'

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

function isInternalPath(path: string, excludePatterns?: (string | RegExp | object)[]): boolean {
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

export default defineNuxtPlugin({
  name: 'i18n-redirect',
  enforce: 'pre',
  setup(nuxtApp) {
    const router = useRouter()
    const i18nStrategy = createI18nStrategy(router)
    const i18nConfig = getI18nConfig() as ModuleOptionsExtend
    const validLocales = i18nConfig.locales?.map((l) => l.code) || []
    const defaultLocale = i18nConfig.defaultLocale || 'en'
    const autoDetectPath = i18nConfig.autoDetectPath || '/'
    const cookieName = getLocaleCookieName(i18nConfig)

    // === SERVER-SIDE LOGIC ===
    if (import.meta.server) {
      const event = useRequestEvent()
      if (!event) return

      const url = getRequestURL(event)
      const path = url.pathname

      // During prerendering, sendRedirect does not abort the Nuxt rendering pipeline,
      // so the renderer continues and may overwrite the 302 with a 404.
      // navigateTo sets ssrContext._renderResponse which properly aborts rendering.
      // At runtime, sendRedirect is more reliable as it immediately ends the HTTP response.
      const isPrerender = !!getHeader(event, 'x-nitro-prerender')
      const performRedirect = (targetUrl: string, code: number = 302): Promise<void> => {
        if (isPrerender) {
          return navigateTo(targetUrl, { redirectCode: code }) as Promise<void>
        }
        return sendRedirect(event, targetUrl, code)
      }

      // Skip internal paths
      if (path.startsWith('/api') || path.startsWith('/_nuxt') || path.startsWith('/_locales') || path.startsWith('/__')) return
      if (path.includes('.') && !path.endsWith('.html')) return

      // Check excludePatterns - throw 404 for internal paths
      if (isInternalPath(path, i18nConfig.excludePatterns)) {
        if (DEBUG) console.error('[i18n-redirect] 404: isInternalPath', path)
        throw createError({ statusCode: 404, statusMessage: 'Static file - should not be processed by i18n' })
      }

      const pathSegments = path.replace(/^\//, '').split('/').filter(Boolean)
      const firstSegment = pathSegments[0]
      const customRegex = i18nConfig.customRegexMatcher

      // Unknown locale: first segment matches locale pattern but is not in validLocales → 404
      if (firstSegment && customRegex && !validLocales.includes(firstSegment)) {
        const source = typeof customRegex === 'string' ? customRegex : customRegex.source
        const regex = new RegExp(`^${source}$`)
        if (regex.test(firstSegment)) {
          if (DEBUG) console.error('[i18n-redirect] 404: unknown locale', firstSegment)
          throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
        }
      }

      // Use path-strategy for 404 checks
      const errorMessage = i18nStrategy.shouldReturn404(path)
      if (errorMessage) {
        if (DEBUG) console.error('[i18n-redirect] 404:', errorMessage, path)
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
      }

      const hasLocalePrefix = Boolean(firstSegment && validLocales.includes(firstSegment))

      // Sync cookie with current locale from URL (always, even when redirects are disabled)
      if (hasLocalePrefix && cookieName) {
        const currentLocale = firstSegment!
        const { watch: _w, ...cookieOpts } = getLocaleCookieOptions()
        setCookie(event, cookieName, currentLocale, cookieOpts)
      }

      // === REDIRECT LOGIC (only when redirects are enabled) ===
      if (i18nConfig.redirects !== false) {
        // Skip during prerender (but not when autoDetectPath === '*')
        const prerenderHeader = getHeader(event, 'x-nitro-prerender')
        const userAgent = getHeader(event, 'user-agent') || ''
        const isRootPath = path === '/' || path === ''
        const isPrerenderOrBot = !!(prerenderHeader || userAgent.includes('Nitro') || !userAgent)
        const skipRedirect = !isRootPath && autoDetectPath !== '*' && isPrerenderOrBot

        if (!skipRedirect) {
          // Detect preferred locale
          // Priority: useState (from server plugin) > cookie > Accept-Language > defaultLocale
          // Exception: for autoDetectPath: '*', ignore useState (which is set from URL)
          let preferredLocale = defaultLocale

          // 1. Check useState (set by server plugins, has highest priority unless autoDetectPath: '*')
          if (autoDetectPath !== '*') {
            const localeState = useState<string | null>('i18n-locale', () => null)
            if (localeState.value && validLocales.includes(localeState.value)) {
              preferredLocale = localeState.value
            }
          }

          // 2. Check cookie (if useState didn't set locale)
          if (preferredLocale === defaultLocale && cookieName) {
            const cookieVal = getCookie(event, cookieName)
            if (cookieVal && validLocales.includes(cookieVal)) {
              preferredLocale = cookieVal
            }
          }

          // 3. Apply Accept-Language detection if nothing else set locale
          if (i18nConfig.autoDetectLanguage && preferredLocale === defaultLocale) {
            const acceptHeader = getHeader(event, 'accept-language')
            const langs = parseAcceptLanguage(acceptHeader)
            for (const lang of langs) {
              const lowerCaseLanguage = lang.toLowerCase()
              const primaryLanguage = lowerCaseLanguage.split('-')[0]
              const found = validLocales.find((l) => l.toLowerCase() === lowerCaseLanguage || l.toLowerCase() === primaryLanguage)
              if (found) {
                preferredLocale = found
                break
              }
            }
          }

          // autoDetectPath: '*' means redirect on all paths, including those with locale prefix
          if (autoDetectPath === '*' && hasLocalePrefix && firstSegment !== preferredLocale) {
            const rest = pathSegments.slice(1).join('/')
            let targetPath: string
            if (preferredLocale === defaultLocale && i18nConfig.strategy === 'prefix_except_default') {
              targetPath = rest ? `/${rest}` : '/'
            } else {
              targetPath = rest ? `/${preferredLocale}/${rest}` : `/${preferredLocale}`
            }
            // Sync cookie to preferred locale BEFORE redirect
            if (cookieName) {
              const { watch: _w2, ...cookieOpts2 } = getLocaleCookieOptions()
              setCookie(event, cookieName, preferredLocale, cookieOpts2)
            }
            if (DEBUG) console.error('[i18n-redirect] REDIRECT autoDetectPath *', { path, targetPath, preferredLocale })
            return performRedirect(targetPath + (url.search || '') + (url.hash || ''))
          }

          // Use path-strategy for redirect (handles paths without locale prefix)
          const redirectPath = i18nStrategy.getClientRedirect(path, preferredLocale)
          if (redirectPath) {
            if (DEBUG) console.error('[i18n-redirect] REDIRECT', { path, redirectPath, preferredLocale })
            return performRedirect(redirectPath + (url.search || '') + (url.hash || ''))
          }
        }
      }
    }

    // === CLIENT-SIDE LOGIC (only when redirects are enabled) ===
    if (import.meta.client && i18nConfig.redirects !== false) {
      const runRedirect = () => {
        const { getPreferredLocale } = useI18nLocale()
        const preferredLocale = getPreferredLocale()
        if (!preferredLocale) return

        const route = useRoute()
        const path = route.path || '/'
        const pathSegments = path.replace(/^\//, '').split('/').filter(Boolean)
        const firstSegment = pathSegments[0]
        const hasLocalePrefix = Boolean(firstSegment && validLocales.includes(firstSegment))

        // autoDetectPath: '*' means redirect on all paths, including those with locale prefix
        if (autoDetectPath === '*' && hasLocalePrefix && firstSegment !== preferredLocale) {
          const rest = pathSegments.slice(1).join('/')
          let targetPath: string
          if (preferredLocale === defaultLocale && i18nConfig.strategy === 'prefix_except_default') {
            targetPath = rest ? `/${rest}` : '/'
          } else {
            targetPath = rest ? `/${preferredLocale}/${rest}` : `/${preferredLocale}`
          }
          navigateTo(targetPath, { replace: true, redirectCode: 302 })
          return
        }

        // Use path-strategy for redirect (handles paths without locale prefix)
        const redirectPath = i18nStrategy.getClientRedirect(path, preferredLocale)
        if (redirectPath) {
          navigateTo(redirectPath, { replace: true, redirectCode: 302 })
        }
      }

      // Run after hydration so useState/cookie from server payload are applied
      nuxtApp.hook('app:mounted', () => {
        runRedirect()
      })

      // Also handle SPA navigation
      router.afterEach((to, from) => {
        // Skip if same path (avoid infinite loops)
        if (to.path === from.path) return

        // Run redirect check on SPA navigation
        setTimeout(() => {
          runRedirect()
        }, 0)
      })
    }
  },
})
