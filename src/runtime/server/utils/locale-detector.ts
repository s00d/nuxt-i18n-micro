import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { withoutAppBaseURL } from '@i18n-micro/utils/app-path'
import { getPreferenceCookieName } from '@i18n-micro/utils/cookie'
import { firstQueryValue, localeFromPath, resolveLocale } from '@i18n-micro/utils/resolve-locale'
import { createI18nConfigResolver } from '@i18n-micro/utils/runtime-config'
import type { H3Event } from 'h3'
import { getCookie, getHeader, getQuery, getRequestURL } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import { useRuntimeConfig } from '#imports'

// ponytail: env is read once per process (Nitro's env does not change while it runs); a
// runtime env switch needs a restart, as for the rest of runtimeConfig.
const resolveConfig = createI18nConfigResolver()

/**
 * The module config with runtime overrides (`runtimeConfig.public.i18nRuntime`, then env), resolved
 * once: every caller of a request, and every request with the same overrides, gets the same object
 * (so override warnings are logged once). Read-only: deep-frozen in dev.
 */
export function getI18nServerConfig(event?: H3Event): ModuleOptionsExtend {
  return resolveConfig(getI18nConfig() as ModuleOptionsExtend, useRuntimeConfig(event).public as Record<string, unknown>)
}

type DetectionConfig = Pick<ModuleOptionsExtend, 'defaultLocale' | 'localeCookie' | 'autoDetectLanguage' | 'strategy' | 'hashMode'> & {
  locales?: { code: string; disabled?: boolean }[]
}

/**
 * - `page`: what the page render shows. The URL decides wherever the router does: a prefix, or the
 *   default locale for an unprefixed URL under prefix_except_default and prefix_and_default (a cookie
 *   must not render `de` on the `en` page). `?locale=` counts only under no_prefix, where no URL
 *   locale exists.
 * - `api`: server API helpers — `?locale=`, a `[locale]` route param or prefix, cookie, header.
 */
export type RequestLocaleMode = 'page' | 'api'

/** The one server detection: i18n.global stores it in `event.context.i18n.locale`, the helpers reuse it. */
export function detectRequestLocale(event: H3Event, config: DetectionConfig, mode: RequestLocaleMode, path?: string): string {
  const validLocales = getEnabledLocaleCodes(config.locales as Locale[])
  const defaultLocale = config.defaultLocale || 'en'
  const urlless = config.strategy === 'no_prefix' || Boolean(config.hashMode)
  const unprefixedIsDefault = config.strategy === 'prefix_except_default' || config.strategy === 'prefix_and_default'
  const cookieName = getPreferenceCookieName(config as ModuleOptionsExtend)
  return resolveLocale({
    defaultLocale,
    validLocales,
    autoDetectLanguage: config.autoDetectLanguage,
    url: urlless && mode === 'page' ? null : urlLocale(event, mode, path, validLocales, unprefixedIsDefault ? defaultLocale : null),
    query: mode === 'api' || config.strategy === 'no_prefix' ? firstQueryValue(getQuery(event).locale) : null,
    queryFirst: mode === 'api',
    cookie: cookieName ? getCookie(event, cookieName) : null,
    acceptLanguage: getHeader(event, 'accept-language'),
  })
}

function urlLocale(event: H3Event, mode: RequestLocaleMode, path: string | undefined, validLocales: string[], unprefixed: string | null) {
  const param = firstQueryValue(event.context.params?.locale)
  if (mode === 'api' && param && validLocales.includes(param)) return param
  const prefix = localeFromPath(path ?? withoutAppBaseURL(getRequestURL(event).pathname, useRuntimeConfig(event).app.baseURL), validLocales)
  return prefix ?? (mode === 'page' ? unprefixed : null)
}

export interface DetectCurrentLocaleConfig {
  fallbackLocale?: string
  defaultLocale?: string
  locales?: { code: string }[]
  localeCookie?: string | null
  autoDetectLanguage?: boolean
}

/**
 * Detects the current locale of a server API request: `detectRequestLocale` with the `api` rules.
 */
export const detectCurrentLocale = (event: H3Event, config: DetectCurrentLocaleConfig, defaultLocale?: string): string => {
  return detectRequestLocale(event, { ...config, defaultLocale: defaultLocale || config.defaultLocale } as DetectionConfig, 'api')
}

/**
 * This request's locale for server API helpers, with the documented API order (query → route
 * param / prefix → cookie → Accept-Language) on every route, `/api` or not — never the page
 * render's locale, which ignores `?locale` under the prefix strategies.
 */
export function getRequestLocale(event: H3Event, config: ModuleOptionsExtend, defaultLocale?: string): string {
  return detectRequestLocale(event, defaultLocale ? { ...config, defaultLocale } : config, 'api')
}
