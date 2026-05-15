import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { createError, defineEventHandler, getRouterParam, send, setResponseHeader } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import { useRuntimeConfig } from '#imports'
import { isEnabledLocale } from '../../utils/active-locales'
import { resolveI18nConfigWithRuntimeOverrides } from '../../utils/runtime-i18n-config'
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
  return send(event, json)
})
