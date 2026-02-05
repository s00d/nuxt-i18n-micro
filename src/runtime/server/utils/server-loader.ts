/**
 * Server-side translation loader
 * Загрузка переводов из Nitro storage (только для сервера)
 */
import type { Translations, ModuleOptionsExtend } from '@i18n-micro/types'
import type { Storage } from 'unstorage'
import { useStorage } from 'nitropack/runtime'
// eslint-disable-next-line import/no-duplicates
import { getI18nPrivateConfig } from '#i18n-internal/config'
// eslint-disable-next-line import/no-duplicates
import { getI18nConfig } from '#i18n-internal/strategy'

// ============================================================================
// HELPERS
// ============================================================================

function deepMerge(target: Translations, source: Translations): Translations {
  if (!target || Object.keys(target).length === 0) {
    return { ...source }
  }
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

function toTranslations(data: unknown): Translations {
  if (!data) return {}
  // unstorage автоматически парсит .json файлы и возвращает объект
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Translations
  }
  return {}
}

// ============================================================================
// LOADERS
// ============================================================================

async function loadFromNitroStorage(storage: Storage, locale: string, pageName?: string): Promise<Translations> {
  const privateConfig = getI18nPrivateConfig()
  const rootDirs = privateConfig.rootDirs || []
  const routesLocaleLinks = privateConfig.routesLocaleLinks || {}

  let merged: Translations = {}
  const fileLookupPage = pageName ? (routesLocaleLinks[pageName] || pageName) : undefined
  const normalizedPage = fileLookupPage?.replace(/\//g, ':')

  for (let i = 0; i < rootDirs.length; i++) {
    const prefix = `assets:i18n_layer_${i}`
    const key = normalizedPage
      ? `${prefix}:pages:${normalizedPage}:${locale}.json`
      : `${prefix}:${locale}.json`

    if (await storage.hasItem(key)) {
      const raw = await storage.getItem(key)
      if (raw) {
        merged = deepMerge(merged, toTranslations(raw))
      }
    }
  }
  return merged
}

async function loadMergedFromServer(locale: string, page: string | undefined): Promise<Translations> {
  const storage = useStorage()

  const general = await loadFromNitroStorage(storage, locale)
  if (!page || page === 'general') {
    return general
  }

  const pageSpecific = await loadFromNitroStorage(storage, locale, page)
  return deepMerge(general, pageSpecific)
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Загрузка переводов из Nitro storage с поддержкой fallback локалей.
 * Используется в API route и server middleware.
 */
export async function loadTranslationsFromServer(locale: string, routeName?: string): Promise<{ data: Translations, json: string }> {
  const config = getI18nConfig() as ModuleOptionsExtend
  const { locales, fallbackLocale } = config

  const localeConfig = locales?.find(l => l.code === locale)
  if (!localeConfig) {
    return { data: {}, json: '{}' }
  }

  const localesToMerge: string[] = [fallbackLocale, localeConfig.fallbackLocale, locale]
    .filter((l): l is string => !!l)
    .filter((v, i, arr) => arr.indexOf(v) === i)

  const page = routeName === 'general' ? undefined : routeName

  let result: Translations = {}
  for (const loc of localesToMerge) {
    const data = await loadMergedFromServer(loc, page)
    result = localesToMerge.length === 1 ? data : deepMerge(result, data)
  }

  const json = JSON.stringify(result).replace(/</g, '\\u003c')
  return { data: result, json }
}
