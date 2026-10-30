/**
 * Nitro middleware: locale detection and event.context.i18n setup only.
 * Redirect logic is handled by plugins and Vue Router redirect routes.
 */

import { isInternalPath, withoutAppBaseURL } from '@i18n-micro/utils/app-path'
import { defineEventHandler, getRequestURL } from 'h3'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { useRuntimeConfig } from '#imports'
import { detectRequestLocale, getI18nServerConfig } from '../utils/locale-detector'
import { loadTranslationsFromServer } from '../utils/server-loader'

export default defineEventHandler(async (event) => {
  const config = getI18nServerConfig(event)
  const path = withoutAppBaseURL(getRequestURL(event).pathname, useRuntimeConfig(event).app.baseURL)

  if (isInternalPath(path, config.excludePatterns, config.apiBaseUrl)) return

  const locale = detectRequestLocale(event, config, 'page', path)

  let translations = {}
  if (getI18nPrivateConfig().serverTranslationPreload) {
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
    // the page render loads its chunks through this, not through a local fetch of /_locales
    load: async (chunkLocale: string, routeName: string) => (await loadTranslationsFromServer(chunkLocale, routeName)).data,
    // the render reuses this request's resolved config (runtime overrides applied once)
    config,
  }
})
