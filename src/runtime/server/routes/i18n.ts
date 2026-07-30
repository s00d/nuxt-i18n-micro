import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { isEnabledLocale } from '@i18n-micro/utils/active-locales'
import { buildTranslationPayloadCacheControl } from '@i18n-micro/utils/payload-url'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { createError, defineEventHandler, getQuery, getRouterParam, send, setResponseHeader } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import { useRuntimeConfig } from '#imports'
import { loadTranslationsFromServer } from '../utils/server-loader'

/**
 * API Route: /_locales/:page/:locale/data.json
 * Returns translations with fallback locales.
 * Uses pre-serialized JSON to avoid repeated serialization.
 */
export default defineEventHandler(async (event) => {
  const page = getRouterParam(event, 'page')
  const locale = getRouterParam(event, 'locale')

  if (!locale || !page) {
    throw createError({ statusCode: 400, statusMessage: 'Missing locale or page' })
  }

  const config = resolveI18nConfigWithRuntimeOverrides(
    getI18nConfig() as ModuleOptionsExtend,
    useRuntimeConfig(event).public as Record<string, unknown>,
  )
  if (!isEnabledLocale(config.locales, locale)) {
    throw createError({ statusCode: 404, statusMessage: 'Locale not found' })
  }

  const { json } = await loadTranslationsFromServer(locale, page)

  // Send pre-serialized JSON directly (no repeated serialization)
  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')

  // Skipped in dev so HMR and live edits are not stuck in the browser cache.
  //
  // `immutable` is decided per request, not per config: `?v=` is a query, so a request that
  // omits it hits the very same URL. Promising a year on that URL pins whatever the browser
  // fetched first, and no deploy can dislodge it. The route rule sends the conservative
  // policy for exactly this reason — it cannot see the query — and this upgrades the answer
  // when the request is actually versioned.
  if (!import.meta.dev) {
    const requested = getQuery(event).v
    const versioned = Boolean(config.dateBuild) && String(requested ?? '') === String(config.dateBuild)

    const cacheControl = buildTranslationPayloadCacheControl(config.httpCacheDuration, versioned)
    if (cacheControl) {
      setResponseHeader(event, 'Cache-Control', cacheControl)
    }
  }

  return send(event, json)
})
