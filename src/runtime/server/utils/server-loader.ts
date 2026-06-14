/**
 * Server-side translation loader.
 * In `premerged` mode, layers/fallback/root+page are merged at build time and this loader
 * reads a single Nitro asset. In `source` mode, compact source files are merged at runtime.
 */

import { SERVER_CC_KEY } from '@i18n-micro/hmr/cache-keys'
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { isEnabledLocale } from '@i18n-micro/utils/active-locales'
import { CacheControl } from '@i18n-micro/utils/cache-control'
import { normalizeConfiguredLocales } from '@i18n-micro/utils/merge-source'
import { fetchTranslationPayloadFromHost } from '@i18n-micro/utils/payload-fetch'
import { resolveTranslationPayloadPage } from '@i18n-micro/utils/payload-url'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { loadSourceTranslationsFromStorage } from '@i18n-micro/utils/source-loader'
import { useStorage } from 'nitropack/runtime'
import { getI18nConfig } from '#i18n-internal/strategy'

// ============================================================================
// SERVER CACHE
// ============================================================================

type CacheEntry = { data: Translations; json: string }

type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

function getServerCacheControl(): CacheControl<CacheEntry> {
  const g = globalThis as GlobalWithCC
  if (!g[SERVER_CC_KEY]) {
    const cfg = resolveI18nConfigWithRuntimeOverrides(getI18nConfig() as ModuleOptionsExtend)
    g[SERVER_CC_KEY] = new CacheControl<CacheEntry>({ maxSize: cfg.cacheMaxSize ?? 0, ttl: cfg.cacheTtl ?? 0 })
  }
  return g[SERVER_CC_KEY] as CacheControl<CacheEntry>
}

// ============================================================================
// HELPERS
// ============================================================================

const ASSETS_PREFIX = 'assets:i18n'

function toTranslations(data: unknown): Translations {
  if (!data) return {}
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Translations
  }
  return {}
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Load translations for a given locale and page.
 * Returns merged translations and a pre-serialized JSON string for the API route.
 */
export async function loadTranslationsFromServer(locale: string, routeName: string): Promise<{ data: Translations; json: string }> {
  const cc = getServerCacheControl()
  const cacheKey = `${locale}:${routeName}`

  const cached = cc.get(cacheKey)
  if (cached) {
    return cached
  }

  const config = resolveI18nConfigWithRuntimeOverrides(getI18nConfig() as ModuleOptionsExtend)
  if (!isEnabledLocale(config.locales, locale)) {
    const empty = { data: {}, json: '{}' }
    cc.set(cacheKey, empty)
    return empty
  }

  const storage = useStorage()
  const routesLocaleLinks = config.routesLocaleLinks || {}
  const resolvedPage = resolveTranslationPayloadPage(routeName, routesLocaleLinks)
  const normalizedPage = resolvedPage.replace(/\//g, ':')

  if (config.apiBaseServerHost) {
    const data = await fetchTranslationPayloadFromHost(config, locale, resolvedPage, $fetch)
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    const entry = { data, json }

    cc.set(cacheKey, entry)
    return entry
  }

  if (config.translationPayloadMode === 'source') {
    const data = await loadSourceTranslationsFromStorage(storage, {
      locale,
      pageName: resolvedPage,
      locales: normalizeConfiguredLocales(config.locales),
      globalFallbackLocale: config.fallbackLocale,
      disablePageLocales: config.disablePageLocales,
    })
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    const entry = { data, json }

    cc.set(cacheKey, entry)
    return entry
  }

  const key = `${ASSETS_PREFIX}:pages:${normalizedPage}:${locale}.json`

  const loaded = await storage.getItem(key)
  const data: Translations = toTranslations(loaded)

  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const entry = { data, json }

  cc.set(cacheKey, entry)
  return entry
}
