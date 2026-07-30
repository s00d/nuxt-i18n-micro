/**
 * Server-side translation loader.
 * - Node: JSON from public locales dir (`#i18n-internal/payload-source` → fs)
 * - Edge: Nitro `serverAssets` (`assets:i18n`)
 * `premerged` reads one file; `source` merges root+page+fallback at runtime.
 */

import { SERVER_CC_KEY } from '@i18n-micro/hmr/cache-keys'
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { isEnabledLocale } from '@i18n-micro/utils/active-locales'
import { CacheControl } from '@i18n-micro/utils/cache-control'
import { normalizeConfiguredLocales, toPremergedStorageKey } from '@i18n-micro/utils/merge-source'
import { fetchTranslationPayloadFromHost } from '@i18n-micro/utils/payload-fetch'
import { resolveTranslationPayloadPage } from '@i18n-micro/utils/payload-url'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { loadSourceTranslationsFromStorage } from '@i18n-micro/utils/source-loader'
import { toTranslations } from '@i18n-micro/utils/normalize'
import { readPayload } from '#i18n-internal/payload-source'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { getI18nConfig } from '#i18n-internal/strategy'

type CacheEntry = { data: Translations, json: string }
type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

function getServerCacheControl(): CacheControl<CacheEntry> {
  const g = globalThis as GlobalWithCC
  if (!g[SERVER_CC_KEY]) {
    const cfg = resolveI18nConfigWithRuntimeOverrides(getI18nConfig() as ModuleOptionsExtend)
    g[SERVER_CC_KEY] = new CacheControl<CacheEntry>({ maxSize: cfg.cacheMaxSize ?? 0, ttl: cfg.cacheTtl ?? 0 })
  }
  return g[SERVER_CC_KEY] as CacheControl<CacheEntry>
}

export async function loadTranslationsFromServer(locale: string, routeName: string): Promise<{ data: Translations, json: string }> {
  const cc = getServerCacheControl()
  const cacheKey = `${locale}:${routeName}`

  const cached = cc.get(cacheKey)
  if (cached) {
    return cached
  }

  const config = resolveI18nConfigWithRuntimeOverrides(getI18nConfig() as ModuleOptionsExtend)
  const privateConfig = getI18nPrivateConfig()
  if (!isEnabledLocale(config.locales, locale)) {
    const empty = { data: {}, json: '{}' }
    cc.set(cacheKey, empty)
    return empty
  }

  const routesLocaleLinks = config.routesLocaleLinks || {}
  const resolvedPage = resolveTranslationPayloadPage(routeName, routesLocaleLinks)

  if (privateConfig.apiBaseServerHost) {
    const data = await fetchTranslationPayloadFromHost(
      { apiBaseUrl: config.apiBaseUrl, apiBaseServerHost: privateConfig.apiBaseServerHost, dateBuild: config.dateBuild },
      locale,
      resolvedPage,
      $fetch,
    )
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    const entry = { data, json }
    cc.set(cacheKey, entry)
    return entry
  }

  const mode = config.translationPayloadMode === 'source' ? 'source' : 'premerged'

  let data: Translations
  if (mode === 'source') {
    data = await loadSourceTranslationsFromStorage(
      { getItem: (key: string) => readPayload(key) },
      {
        locale,
        pageName: resolvedPage,
        locales: normalizeConfiguredLocales(config.locales),
        globalFallbackLocale: config.fallbackLocale,
        disablePageLocales: config.disablePageLocales,
      },
    )
  }
  else {
    data = toTranslations(await readPayload(toPremergedStorageKey(resolvedPage, locale)))
  }

  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const entry = { data, json }
  cc.set(cacheKey, entry)
  return entry
}
