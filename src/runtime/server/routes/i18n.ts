import { defineEventHandler, getRouterParam, setResponseHeader, createError } from 'h3'
import type { Translations, ModuleOptionsExtend } from '@i18n-micro/types'
import { getI18nConfig } from '#i18n-internal/strategy'
import { loadTranslationsFromStorage } from '../utils/load-from-storage'

function deepMerge(target: Translations, source: Translations): Translations {
  const output = { ...target }
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor') continue
    const src = source[key]
    const dst = output[key]
    if (src && typeof src === 'object' && !Array.isArray(src) && dst && typeof dst === 'object' && !Array.isArray(dst)) {
      output[key] = deepMerge(dst as Translations, src as Translations)
    }
    else {
      output[key] = src
    }
  }
  return output
}

/**
 * Handles /_locales/:page/:locale/data.json (or apiBaseUrl).
 * Returns merged translations (General + Page) for CDN caching and Nginx config.
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')

  const page = getRouterParam(event, 'page')
  const locale = getRouterParam(event, 'locale')

  if (!locale || !page) {
    throw createError({ statusCode: 400, statusMessage: 'Missing locale or page' })
  }

  const publicConfig = getI18nConfig() as ModuleOptionsExtend
  const { locales, fallbackLocale } = publicConfig

  const currentLocaleConfig = locales?.find(l => l.code === locale)
  if (!currentLocaleConfig) {
    throw createError({ statusCode: 404, statusMessage: 'Locale not found' })
  }

  const localesToMerge = [
    fallbackLocale,
    currentLocaleConfig.fallbackLocale,
    locale,
  ]
    .filter((l): l is string => !!l)
    .filter((value, index, self) => self.indexOf(value) === index)

  let result: Translations = {}
  for (const loc of localesToMerge) {
    const data = await loadTranslationsFromStorage(loc, page === 'general' ? undefined : page)
    result = deepMerge(result, data)
  }

  return result
})
