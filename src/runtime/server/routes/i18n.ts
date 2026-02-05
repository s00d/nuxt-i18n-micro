import { defineEventHandler, getRouterParam, setResponseHeader, createError } from 'h3'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { getI18nConfig } from '#i18n-internal/strategy'
import { loadTranslationsFromServer } from '../utils/server-loader'

/**
 * API Route: /_locales/:page/:locale/data.json
 * Возвращает переводы с fallback локалями.
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')

  const page = getRouterParam(event, 'page')
  const locale = getRouterParam(event, 'locale')

  if (!locale || !page) {
    throw createError({ statusCode: 400, statusMessage: 'Missing locale or page' })
  }

  const config = getI18nConfig() as ModuleOptionsExtend
  if (!config.locales?.find(l => l.code === locale)) {
    throw createError({ statusCode: 404, statusMessage: 'Locale not found' })
  }

  const { data } = await loadTranslationsFromServer(locale, page === 'general' ? undefined : page)
  return data
})
