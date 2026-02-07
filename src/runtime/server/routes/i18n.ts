import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { createError, defineEventHandler, getRouterParam, send, setResponseHeader } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import { loadTranslationsFromServer } from '../utils/server-loader'

/**
 * API Route: /_locales/:page/:locale/data.json
 * Возвращает переводы с fallback локалями.
 * Использует pre-serialized JSON для избежания повторной сериализации.
 */
export default defineEventHandler(async (event) => {
  const page = getRouterParam(event, 'page')
  const locale = getRouterParam(event, 'locale')

  if (!locale || !page) {
    throw createError({ statusCode: 400, statusMessage: 'Missing locale or page' })
  }

  const config = getI18nConfig() as ModuleOptionsExtend
  if (!config.locales?.find((l) => l.code === locale)) {
    throw createError({ statusCode: 404, statusMessage: 'Locale not found' })
  }

  const { json } = await loadTranslationsFromServer(locale, page === 'general' ? undefined : page)

  // Отправляем готовый JSON напрямую (без повторной сериализации)
  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  return send(event, json)
})
