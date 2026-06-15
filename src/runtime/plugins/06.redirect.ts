/**
 * Universal redirect plugin for i18n routes (works on both server and client).
 * Handles locale detection, 404 checks, and redirects.
 * Client SPA redirects are handled by i18n-redirect route middleware.
 */

import { isInternalPath } from '@i18n-micro/route-strategy'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategy } from '@i18n-micro/path-strategy'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { getLocaleCookieName, getLocaleCookieOptions } from '@i18n-micro/utils/cookie'
import { resolvePreferredLocale } from '@i18n-micro/utils/resolve-locale'
import { getCookie, getHeader, getRequestURL, setCookie } from 'h3'
import { createError, defineNuxtPlugin, navigateTo, useRequestEvent, useState } from '#imports'

const DEBUG = process.env.NUXT_I18N_DEBUG_REDIRECT === '1'

function resolveI18nStrategy(nuxtApp: { $i18nStrategy?: PathStrategy }): PathStrategy {
  if (nuxtApp.$i18nStrategy) {
    return nuxtApp.$i18nStrategy
  }
  throw new Error('[nuxt-i18n-micro] i18n redirect plugin requires the main i18n plugin ($i18nStrategy).')
}

export default defineNuxtPlugin({
  name: 'i18n-redirect',
  dependsOn: ['i18n-plugin-loader'],
  setup(nuxtApp) {
    const i18nStrategy = resolveI18nStrategy(nuxtApp as { $i18nStrategy?: PathStrategy })
    const getRuntimeConfig = (nuxtApp as unknown as { $getI18nConfig?: () => ModuleOptionsExtend }).$getI18nConfig
    if (typeof getRuntimeConfig !== 'function') {
      throw new Error('[nuxt-i18n-micro] i18n redirect plugin requires $getI18nConfig from the main i18n plugin.')
    }
    const i18nConfig = getRuntimeConfig()
    const validLocales = getEnabledLocaleCodes(i18nConfig.locales)
    const defaultLocale = i18nConfig.defaultLocale || 'en'
    const autoDetectPath = i18nConfig.autoDetectPath || '/'
    const cookieName = getLocaleCookieName(i18nConfig)

    if (import.meta.server) {
      const event = useRequestEvent()
      if (!event) return

      const url = getRequestURL(event)
      const path = url.pathname

      const performRedirect = (targetUrl: string, code: number = 302): Promise<void> => {
        return navigateTo(targetUrl, { redirectCode: code }) as Promise<void>
      }

      if (path.startsWith('/api') || path.startsWith('/_nuxt') || path.startsWith('/_locales') || path.startsWith('/__')) return
      if (path.includes('.') && !path.endsWith('.html')) return

      if (isInternalPath(path, i18nConfig.excludePatterns)) {
        if (DEBUG) console.error('[i18n-redirect] 404: isInternalPath', path)
        throw createError({ statusCode: 404, statusMessage: 'Static file - should not be processed by i18n' })
      }

      const pathSegments = path.replace(/^\//, '').split('/').filter(Boolean)
      const firstSegment = pathSegments[0]
      const customRegex = i18nConfig.customRegexMatcher

      if (firstSegment && customRegex && !validLocales.includes(firstSegment)) {
        const source = typeof customRegex === 'string' ? customRegex : customRegex.source
        const regex = new RegExp(`^${source}$`)
        if (regex.test(firstSegment)) {
          if (DEBUG) console.error('[i18n-redirect] 404: unknown locale', firstSegment)
          throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
        }
      }

      const errorMessage = i18nStrategy.shouldReturn404(path)
      if (errorMessage) {
        if (DEBUG) console.error('[i18n-redirect] 404:', errorMessage, path)
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
      }

      const hasLocalePrefix = Boolean(firstSegment && validLocales.includes(firstSegment))

      const shouldDeferCookieSync = i18nConfig.redirects !== false && autoDetectPath === '*'
      if (hasLocalePrefix && cookieName && !shouldDeferCookieSync) {
        const currentLocale = firstSegment!
        const { watch: _w, ...cookieOpts } = getLocaleCookieOptions()
        setCookie(event, cookieName, currentLocale, cookieOpts)
      }

      if (i18nConfig.redirects !== false) {
        const prerenderHeader = getHeader(event, 'x-nitro-prerender')
        const userAgent = getHeader(event, 'user-agent') || ''
        const isRootPath = path === '/' || path === ''
        const isPrerenderOrBot = !!(prerenderHeader || userAgent.includes('Nitro') || !userAgent)
        const skipRedirect = !isRootPath && autoDetectPath !== '*' && isPrerenderOrBot

        if (!skipRedirect) {
          const localeState = autoDetectPath !== '*' ? useState<string | null>('i18n-locale', () => null) : null
          let preferredLocale = resolvePreferredLocale({
            defaultLocale,
            validLocales,
            autoDetectLanguage: i18nConfig.autoDetectLanguage,
            stateLocale: localeState?.value ?? null,
            cookieLocale: cookieName ? getCookie(event, cookieName) : null,
            acceptLanguageHeader: getHeader(event, 'accept-language'),
            ignoreStateLocale: autoDetectPath === '*',
          })

          if (autoDetectPath === '*' && !hasLocalePrefix) {
            preferredLocale = defaultLocale
          }

          if (autoDetectPath === '*' && hasLocalePrefix && firstSegment !== preferredLocale) {
            const rest = pathSegments.slice(1).join('/')
            let targetPath: string
            if (preferredLocale === defaultLocale && i18nConfig.strategy === 'prefix_except_default') {
              targetPath = rest ? `/${rest}` : '/'
            } else {
              targetPath = rest ? `/${preferredLocale}/${rest}` : `/${preferredLocale}`
            }
            if (cookieName) {
              const { watch: _w2, ...cookieOpts2 } = getLocaleCookieOptions()
              setCookie(event, cookieName, preferredLocale, cookieOpts2)
            }
            if (DEBUG) console.error('[i18n-redirect] REDIRECT autoDetectPath *', { path, targetPath, preferredLocale })
            return performRedirect(targetPath + (url.search || '') + (url.hash || ''))
          }

          const redirectPath = i18nStrategy.getClientRedirect(path, preferredLocale)
          if (redirectPath) {
            if (DEBUG) console.error('[i18n-redirect] REDIRECT', { path, redirectPath, preferredLocale })
            return performRedirect(redirectPath + (url.search || '') + (url.hash || ''))
          }
        }
      }
    }
  },
})
