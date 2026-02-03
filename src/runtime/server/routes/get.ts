import { defineEventHandler, setResponseHeader } from 'h3'
import type { Translations, ModuleOptionsExtend, ModulePrivateOptionsExtend } from '@i18n-micro/types'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - #imports are available in Nitro
import { createError, useStorage } from '#imports'
// eslint-disable-next-line import/no-duplicates
import { getI18nConfig } from '#i18n-internal/strategy'
// eslint-disable-next-line import/no-duplicates
import { getI18nPrivateConfig } from '#i18n-internal/config'

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

// Key for storing current build version in storage
const META_VERSION_KEY = 'meta:version'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')

  const { page, locale } = event.context.params as { page: string, locale: string }
  const privateConfig = getI18nPrivateConfig() as ModulePrivateOptionsExtend
  const publicConfig = getI18nConfig() as ModuleOptionsExtend

  const { debug, rootDirs, routesLocaleLinks } = privateConfig
  const { locales, dateBuild, fallbackLocale } = publicConfig

  // 1. Validation
  const currentLocaleConfig = locales?.find(l => l.code === locale)
  if (!currentLocaleConfig) {
    throw createError({ statusCode: 404, statusMessage: 'Locale not found' })
  }

  const fileLookupPage = (routesLocaleLinks && routesLocaleLinks[page]) ? routesLocaleLinks[page] : page

  // 2. Initialize cache storage
  const cacheStorage = useStorage('cache')
  // dateBuild comes as number, convert to string. If missing - 'dev'.
  const currentBuildId = String(dateBuild ?? 'dev')

  // 3. VERSION CHECK AND CLEANUP (Garbage Collection)
  // This solves the problem with fs and redis, preventing cache from growing infinitely.
  // We check the stored version. If it differs from current - clear everything.
  const storedBuildId = await cacheStorage.getItem(META_VERSION_KEY)

  if (storedBuildId !== currentBuildId) {
    try {
      // Only clear if there was a previous version (not first run)
      // On first run (storedBuildId is null/undefined), cache is already empty, so clear() is unnecessary
      // and may fail with ENOENT if directory doesn't exist yet
      if (storedBuildId != null) {
        // clear() will remove ALL keys in 'cache' namespace.
        // For fs this means file deletion, for redis - FLUSHDB (or prefix-based deletion).
        // This is much faster and more reliable than manually iterating keys.
        await cacheStorage.clear()
      }

      // Save new version
      await cacheStorage.setItem(META_VERSION_KEY, currentBuildId)
    }
    catch (e: unknown) {
      // Ignore ENOENT (file/directory doesn't exist) and ENOTEMPTY (directory not empty)
      // ENOENT is normal on first run, ENOTEMPTY can happen during parallel requests (prerendering)
      // where multiple requests detect version change simultaneously
      const error = e as { code?: string }
      if (error?.code !== 'ENOENT' && error?.code !== 'ENOTEMPTY') {
        console.warn('[i18n] Failed to clear cache storage:', e)
      }
    }
  }

  // 4. Build cache key (we could omit buildId since we clear storage,
  // but it's better to keep buildId for reliability to avoid race conditions during deployment)
  const cacheKey = `i18n:${currentBuildId}:${page}:${locale}`

  // 5. Check cache (Fast Path)
  const cachedMerged = await cacheStorage.getItem(cacheKey)
  if (cachedMerged) {
    return cachedMerged
  }

  // 6. Build from assets (Slow Path)
  // Use general storage for reading assets (read-only)
  // Assets registered in module.ts via serverAssets are available under 'assets:' prefix with baseName as part of path
  const storage = useStorage()

  // Helper for safe JSON parsing
  // Prevents crashes when files are empty or contain invalid JSON
  const safeParse = (data: unknown, label: string): Translations => {
    if (!data) return {}
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) return data as Translations // Already an object (memory driver)
    try {
      // Handle empty strings or whitespace-only strings
      const trimmed = typeof data === 'string' ? data.trim() : String(data).trim()
      if (!trimmed || trimmed === '') return {}
      return JSON.parse(trimmed) as Translations
    }
    catch (e) {
      // Log warning but don't crash - return empty object instead
      if (debug) console.warn(`[i18n] Failed to parse JSON for ${label}:`, e)
      return {}
    }
  }

  const loadLayer = async (targetLocale: string) => {
    let mergedLayer: Translations = {}

    for (let i = 0; i < rootDirs.length; i++) {
      const layerPrefix = `assets:i18n_layer_${i}`

      const globalKey = `${layerPrefix}:${targetLocale}.json`
      const globalRaw = await storage.getItem(globalKey)
      if (globalRaw) {
        mergedLayer = deepMerge(mergedLayer, safeParse(globalRaw, globalKey))
      }

      if (fileLookupPage !== 'general') {
        const normalizedPage = fileLookupPage.replace(/\//g, ':')
        const pageKey = `${layerPrefix}:pages:${normalizedPage}:${targetLocale}.json`
        const pageRaw = await storage.getItem(pageKey)
        if (pageRaw) {
          mergedLayer = deepMerge(mergedLayer, safeParse(pageRaw, pageKey))
        }
      }
    }
    return mergedLayer
  }

  // 7. Merge translations
  let finalTranslations: Translations = {}
  const localesToMerge = [
    fallbackLocale,
    currentLocaleConfig.fallbackLocale,
    locale,
  ]
    .filter((l): l is string => !!l) // Remove undefined/null
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates

  for (const loc of localesToMerge) {
    const layerData = await loadLayer(loc)
    finalTranslations = deepMerge(finalTranslations, layerData)
  }

  // 8. Write to cache
  try {
    await cacheStorage.setItem(cacheKey, finalTranslations)
  }
  catch (e: unknown) {
    // Ignore ENOENT errors (directory doesn't exist) - cache write is optional
    // This can happen during prerendering if cache directory wasn't created yet
    const error = e as { code?: string }
    if (error?.code !== 'ENOENT') {
      if (debug) console.warn(`[i18n] Failed to cache ${cacheKey}:`, e)
    }
  }

  return finalTranslations
})
