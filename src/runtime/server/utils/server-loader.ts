/**
 * Server-side translation loader.
 * - Node: JSON from public locales dir (`#i18n-internal/payload-source` → fs)
 * - Edge: Nitro `serverAssets` (`assets:i18n`)
 * - Dev cache miss: live locale-file merge (not stale `.nuxt/i18n-*`)
 * `premerged` reads one file; `source` merges root+page+fallback at runtime.
 */

import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { isEnabledLocale } from '@i18n-micro/utils/active-locales'
import { normalizeConfiguredLocales, toPremergedStorageKey } from '@i18n-micro/utils/merge-source'
import { fetchTranslationPayloadFromHost, type TranslationPayloadFetcher } from '@i18n-micro/utils/payload-fetch'
import { resolveTranslationPayloadPage } from '@i18n-micro/utils/payload-url'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { loadSourceTranslationsFromStorage } from '@i18n-micro/utils/source-loader'
import { toTranslations } from '@i18n-micro/utils/normalize'
import { readPayload } from '#i18n-internal/payload-source'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { getI18nConfig } from '#i18n-internal/strategy'
import { loadLiveDevTranslations } from './dev-live-translations'
import { getOrCreateServerTranslationCache } from './server-translation-cache'

export async function loadTranslationsFromServer(locale: string, routeName: string): Promise<{ data: Translations; json: string }> {
  const config = resolveI18nConfigWithRuntimeOverrides(getI18nConfig() as ModuleOptionsExtend)
  const cc = getOrCreateServerTranslationCache({
    maxSize: config.cacheMaxSize ?? 0,
    ttl: config.cacheTtl ?? 0,
  })
  const cacheKey = `${locale}:${routeName}`

  const cached = cc.get(cacheKey)
  if (cached) {
    return cached
  }

  const privateConfig = getI18nPrivateConfig()
  if (!isEnabledLocale(config.locales, locale)) {
    const empty = { data: {}, json: '{}' }
    cc.set(cacheKey, empty)
    return empty
  }

  const routesLocaleLinks = config.routesLocaleLinks || {}
  const resolvedPage = resolveTranslationPayloadPage(routeName, routesLocaleLinks)

  if (privateConfig.apiBaseServerHost) {
    // Untyped: Nitro MatchedRoutes on `/_locales/:page/:locale/...` → TS2321.
    const data = await fetchTranslationPayloadFromHost(
      { apiBaseUrl: config.apiBaseUrl, apiBaseServerHost: privateConfig.apiBaseServerHost, dateBuild: config.dateBuild },
      locale,
      resolvedPage,
      $fetch as TranslationPayloadFetcher,
    )
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    const entry = { data, json }
    cc.set(cacheKey, entry)
    return entry
  }

  let data: Translations
  if (import.meta.dev) {
    // Live files — HMR updates memory only; buildDir snapshot is stale after edits.
    data = await loadLiveDevTranslations(locale, resolvedPage, config)
  } else {
    const mode = config.translationPayloadMode === 'source' ? 'source' : 'premerged'
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
    } else {
      data = toTranslations(await readPayload(toPremergedStorageKey(resolvedPage, locale)))
    }
  }

  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const entry = { data, json }
  cc.set(cacheKey, entry)
  return entry
}
