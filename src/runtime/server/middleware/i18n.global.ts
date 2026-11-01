/**
 * Nitro middleware: locale detection and event.context.i18n setup only.
 * Redirect logic is handled by plugins and Vue Router redirect routes.
 */

import { isInternalPath, withoutAppBaseURL } from '@i18n-micro/utils/app-path'
import { defineEventHandler } from 'h3'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { domains } from '#i18n-internal/strategy'
import { useRuntimeConfig } from '#imports'
import { requestURL } from '../../utils/request-url'
import { detectRequestLocale, getI18nServerConfig } from '../utils/locale-detector'
import { loadTranslationsFromServer, NO_FILE } from '../utils/server-loader'

/** The page render loads its chunks through this, not through a local fetch of /_locales. `null`: the host has no file for it. */
async function load(locale: string, routeName: string) {
  const entry = await loadTranslationsFromServer(locale, routeName)
  return entry === NO_FILE ? null : entry.data
}

export default defineEventHandler(async (event) => {
  const config = getI18nServerConfig(event)
  const path = withoutAppBaseURL(requestURL(event).pathname, useRuntimeConfig(event).app.baseURL)
  const { serverTranslationPreload } = getI18nPrivateConfig()

  // internals only: excludePatterns mean "not localized, not redirected", and those pages still render with i18n
  if (isInternalPath(path, undefined, config.apiBaseUrl)) {
    // an error page renders through an internal path: it belongs to its host, and its chunks enter the process-wide
    // cache, so it reads them the way every page does (a local fetch would answer them from the public copy)
    event.context.i18n = (domains ? { load, config } : { load }) as typeof event.context.i18n
    return
  }

  // hash + prefix: `/` has no record and the server never sees the route in the hash, so the client renders it
  if (config.hashMode && config.strategy === 'prefix' && path === '/') event.context.nuxt = { ...event.context.nuxt, noSSR: true }

  const locale = detectRequestLocale(event, config, 'page', path)

  let translations = {}
  if (serverTranslationPreload) {
    try {
      const loaded = await loadTranslationsFromServer(locale, 'index')
      translations = loaded.data
    } catch {
      translations = {}
    }
  }

  event.context.i18n = {
    locale,
    translations,
    load,
    // the render reuses this request's resolved config (runtime overrides applied once)
    config,
  }
})
