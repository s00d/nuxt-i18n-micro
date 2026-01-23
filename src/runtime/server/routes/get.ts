import { defineEventHandler, setResponseHeader } from 'h3'
import type { Translations, ModuleOptionsExtend, ModulePrivateOptionsExtend } from '@i18n-micro/types'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - #imports доступны в Nitro
import { useRuntimeConfig, createError, useStorage } from '#imports'

let storageInit = false

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

// Хелпер для безопасного парсинга данных из стореджа
function parseStorageData(data: unknown, debug = false, path?: string): Translations | null {
  if (!data) return null
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    }
    catch (e) {
      if (debug) {
        console.error(`[i18n] Error parsing storage data${path ? ` for ${path}` : ''}:`, e)
      }
      return null
    }
  }
  return data as Translations
}

export default defineEventHandler(async (event) => {
  // Set proper Content-Type header for JSON responses
  setResponseHeader(event, 'Content-Type', 'application/json')

  const { page, locale } = event.context.params as { page: string, locale: string }
  const config = useRuntimeConfig()
  const { rootDirs, debug, routesLocaleLinks } = config.i18nConfig as ModulePrivateOptionsExtend
  const { locales } = config.public.i18nConfig as unknown as ModuleOptionsExtend

  // Always validate locale against configured locales to avoid serving data for invalid or disabled locales
  if (locales && !locales.map(l => l.code).includes(locale)) {
    throw createError({ statusCode: 404 })
  }

  // Определяем имя страницы, по которому ищем файл перевода
  let fileLookupPage = page
  if (routesLocaleLinks && page && (routesLocaleLinks as Record<string, string>)[page]) {
    fileLookupPage = (routesLocaleLinks as Record<string, string>)[page] || page
    if (debug) {
      console.log(`[i18n] Route link found: '${page}' -> '${fileLookupPage}'. Using linked translations.`)
    }
  }

  const serverStorage = useStorage('assets:server')
  // Кэшируем по исходному имени страницы, а не по ссылочному
  const cacheKey = `_locales:merged:${page}:${locale}`

  if (!storageInit) {
    if (debug) console.log('[nuxt-i18n-micro] clear storage cache')
    await Promise.all((await serverStorage.getKeys('_locales')).map((key: string) => serverStorage.removeItem(key)))
    storageInit = true
  }

  const cachedMerged = await serverStorage.getItem(cacheKey)
  if (cachedMerged) {
    return cachedMerged
  }

  // Используем общее хранилище Nitro. Ассеты, которые мы зарегистрировали в module.ts,
  // доступны под префиксом 'assets:'.
  const storage = useStorage()

  let finalTranslations: Translations = {}
  const currentLocaleConfig = locales?.find(l => l.code === locale) ?? null

  // Function to load translations from all layers (via storage) and merge them
  const loadAndMerge = async (targetLocale: string) => {
    let globalTranslations: Translations = {}
    let pageTranslations: Translations = {}

    // Iterate through all layers (indices corresponding to rootDirs)
    for (let i = 0; i < rootDirs.length; i++) {
      const layerPrefix = `assets:i18n_layer_${i}`

      // 1. Load Global Translations: {locale}.json
      const globalKey = `${layerPrefix}:${targetLocale}.json`
      const globalContentRaw = await storage.getItem(globalKey)
      const globalContent = parseStorageData(globalContentRaw, debug, globalKey)

      if (globalContent) {
        globalTranslations = deepMerge(globalTranslations, globalContent)
      }

      // 2. Load Page Translations: pages/{page}/{locale}.json
      if (page !== 'general') {
        // Normalize page path for storage key (replace slashes with colons)
        // e.g. "products/slug" -> "products:slug"
        const normalizedPage = fileLookupPage.replace(/\//g, ':')
        const pageKey = `${layerPrefix}:pages:${normalizedPage}:${targetLocale}.json`
        const pageContentRaw = await storage.getItem(pageKey)
        const pageContent = parseStorageData(pageContentRaw, debug, pageKey)

        if (pageContent) {
          pageTranslations = deepMerge(pageTranslations, pageContent)
        }
      }
    }

    return deepMerge(globalTranslations, pageTranslations)
  }

  const fallbackLocalesList = [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    config.i18nConfig?.fallbackLocale,
    currentLocaleConfig?.fallbackLocale,
  ].filter((l): l is string => !!l && l !== locale)

  for (const fb of [...new Set(fallbackLocalesList)]) {
    const fbTranslations = await loadAndMerge(fb)
    finalTranslations = deepMerge(finalTranslations, fbTranslations)
  }

  const mainTranslations = await loadAndMerge(locale)
  finalTranslations = deepMerge(finalTranslations, mainTranslations)

  await serverStorage.setItem(cacheKey, finalTranslations)
  return finalTranslations
})
