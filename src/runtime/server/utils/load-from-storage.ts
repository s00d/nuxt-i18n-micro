/**
 * Storage utilities for i18n translations (server-only).
 * Used by middleware, routes and translation-server-middleware.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - useStorage available in Nitro
import { useStorage } from '#imports'
import type { Storage } from 'unstorage'
import type { Translations } from '@i18n-micro/types'
import { getI18nPrivateConfig } from '#i18n-internal/config'

export function deepMerge(target: Translations, source: Translations): Translations {
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

function safeParse(data: unknown): Translations {
  if (!data) return {}
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) return data as Translations
  try {
    const trimmed = typeof data === 'string' ? data.trim() : String(data).trim()
    if (!trimmed || trimmed === '') return {}
    return JSON.parse(trimmed) as Translations
  }
  catch {
    return {}
  }
}

/**
 * Low-level: Loads translations for a specific layer from storage.
 * @param storage - Nitro storage instance
 * @param locale - Locale code
 * @param pageName - Optional route name. When omitted, loads general only.
 */
export async function loadLayerTranslations(
  storage: Storage,
  locale: string,
  pageName?: string,
): Promise<Translations> {
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
        const data = safeParse(raw)
        merged = deepMerge(merged, data)
      }
    }
  }
  return merged
}

/**
 * High-level: Loads General translations AND optionally Page translations, merging them.
 * Always loads General first, then merges Page on top.
 * Used by Middleware and API Routes.
 */
export async function loadTranslationsFromStorage(locale: string, page?: string): Promise<Translations> {
  const storage = useStorage()

  // 1. Always load General first
  const general = await loadLayerTranslations(storage, locale)

  if (!page || page === 'general') {
    return general
  }

  // 2. Load page-specific and merge (Page overrides General)
  const pageSpecific = await loadLayerTranslations(storage, locale, page)
  return deepMerge(general, pageSpecific)
}
