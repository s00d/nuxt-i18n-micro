/**
 * Server-side locale redirects and 404s for i18n routes. Every decision is the strategy's
 * (`shouldReturn404`, `getClientRedirect`); this plugin only reads the request (cookie,
 * Accept-Language) and writes the response. Client SPA redirects: the i18n-redirect middleware.
 */

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategy } from '@i18n-micro/path-strategy'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { isInternalPath, withoutAppBaseURL } from '@i18n-micro/utils/app-path'
import { getLocaleCookieName, getLocaleCookieOptions, getPreferenceCookieName } from '@i18n-micro/utils/cookie'
import { preferenceCounts, redirectLocale } from '@i18n-micro/utils/resolve-locale'
import { appendResponseHeader, getCookie, getHeader, getRequestURL, setCookie } from 'h3'
import { applyTrailingSlash } from '../utils/trailing-slash'
import { createError, defineNuxtPlugin, navigateTo, useRequestEvent, useRouter, useRuntimeConfig, useState } from '#imports'

const DEBUG = process.env.NUXT_I18N_DEBUG_REDIRECT === '1'

export default defineNuxtPlugin({
  name: 'i18n-redirect',
  dependsOn: ['i18n-plugin-loader'],
  // annotated: the plugin types are inferred from every plugin's setup, this one included
  setup(nuxtApp): Promise<void> | void {
    if (!import.meta.server) return
    const i18nStrategy: PathStrategy = nuxtApp.$i18nStrategy
    const getRuntimeConfig: () => ModuleOptionsExtend = nuxtApp.$getI18nConfig
    const event = useRequestEvent()
    if (!event) return

    const i18nConfig = getRuntimeConfig()
    const url = getRequestURL(event)
    const path = withoutAppBaseURL(url.pathname, useRuntimeConfig().app.baseURL)
    const alwaysPrefixed = i18nConfig.strategy === 'prefix'
    const preferenceCookie = getPreferenceCookieName(i18nConfig)
    const varyOnVisitor = () => {
      const vary = [preferenceCookie && 'Cookie', i18nConfig.autoDetectLanguage && 'Accept-Language'].filter(Boolean)
      if (vary.length) appendResponseHeader(event, 'Vary', vary.join(', '))
    }
    // No locale in the URL: the visitor decides the page, excluded ones too (hash + prefix never renders here)
    const urlless = i18nConfig.strategy === 'no_prefix' || (i18nConfig.hashMode && !alwaysPrefixed)
    if (urlless) varyOnVisitor()

    // Internals / static assets / Content (`/__nuxt_content`) are never 404'd or redirected.
    if (isInternalPath(path, i18nConfig.excludePatterns, i18nConfig.apiBaseUrl)) return

    const notFound = i18nStrategy.shouldReturn404(path)
    if (notFound) {
      if (DEBUG) console.error('[i18n-redirect] 404:', notFound, path)
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }

    const defaultLocale = i18nConfig.defaultLocale || 'en'
    const autoDetectPath = i18nConfig.autoDetectPath || '/'
    const anyPath = autoDetectPath === '*'
    const redirects = i18nConfig.redirects !== false
    const cookieName = getLocaleCookieName(i18nConfig)
    const urlLocale = i18nStrategy.getLocaleFromPath(path)
    const writeCookie = (locale: string) => {
      if (!cookieName) return
      const { watch: _watch, decode: _decode, ...options } = getLocaleCookieOptions()
      setCookie(event, cookieName, locale, options)
    }

    // Where the visitor decides the redirect, a cache must not share the answer. prefix_and_default never moves an unprefixed URL.
    const redirectable = redirects && !urlless && !i18nConfig.hashMode && (urlLocale || i18nConfig.strategy !== 'prefix_and_default')
    if (redirectable && preferenceCounts({ path, urlLocale, autoDetectPath, alwaysPrefixed })) varyOnVisitor()

    // only a page speaks for the locale: not a 404, and under no_prefix `/de` is no prefix
    const router = useRouter()
    // `pages: false`: Nuxt's stub router has no records, so nothing can be missing
    const served = i18nConfig.strategy !== 'no_prefix' && (router.getRoutes().length === 0 || router.currentRoute.value.matched.length > 0)
    // A prefixed URL is the visitor's choice, unless `'*'` may still move it to the preferred locale.
    if (urlLocale && served && !(redirects && anyPath)) writeCookie(urlLocale)
    // Under hash + prefix a document holds no route: it moves into the hash, the client takes it from there.
    if (i18nConfig.hashMode && alwaysPrefixed)
      return navigateTo(`/#${applyTrailingSlash(path, i18nConfig.trailingSlash)}${url.search}`, { redirectCode: 302 }) as Promise<void>
    // Under hashMode the locale lives in the hash and the hash cookie: `/` keeps its document URL.
    if (!redirects || i18nConfig.hashMode) return

    // Cookie / Accept-Language only count where `autoDetectPath` allows them (#242). No `query`:
    // under prefix strategies the URL decides (D1), and no_prefix never redirects.
    const preferred = redirectLocale({
      path,
      urlLocale,
      autoDetectPath,
      alwaysPrefixed,
      defaultLocale,
      validLocales: getEnabledLocaleCodes(i18nConfig.locales),
      autoDetectLanguage: i18nConfig.autoDetectLanguage,
      cookie: preferenceCookie ? getCookie(event, preferenceCookie) : null,
      acceptLanguage: getHeader(event, 'accept-language'),
      // a state differing from what the URL resolved to was set by the app (a plugin): a choice
      state: anyPath ? null : chosenState(useState<string | null>('i18n-locale', () => null).value, event.context.i18n?.locale),
    })
    const target: string | null = i18nStrategy.getClientRedirect(path, preferred, { switchPrefixed: anyPath })
    if (!target) return
    if (anyPath && urlLocale) writeCookie(preferred)
    if (DEBUG) console.error('[i18n-redirect] REDIRECT', { path, target, preferred })
    return navigateTo(applyTrailingSlash(target, i18nConfig.trailingSlash) + url.search + url.hash, { redirectCode: 302 }) as Promise<void>
  },
})

/** The locale state as a preference: only when the app set it, not when it mirrors the URL's locale. */
function chosenState(state: string | null, urlLocale: string | undefined): string | null {
  return state && state !== urlLocale ? state : null
}
