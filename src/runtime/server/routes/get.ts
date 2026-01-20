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

  // Функция загрузки через Storage API (Serverless compatible)
  const loadAndMerge = async (targetLocale: string) => {
    let globalTranslations: Translations = {}
    let pageTranslations: Translations = {}

    // Перебираем все слои (layers), соответствующие rootDirs
    // Мы зарегистрировали их как i18n_layer_0, i18n_layer_1 и т.д.
    for (let i = 0; i < rootDirs.length; i++) {
      const layerPrefix = `assets:i18n_layer_${i}`

      // 1. Загрузка глобальных переводов: {locale}.json
      // В Storage API разделители путей заменяются на двоеточия
      const globalKey = `${layerPrefix}:${targetLocale}.json`

      try {
        // getItem вернет null, если файла нет, или распарсенный JSON (Nitro делает это сам для .json)
        const globalContent = await storage.getItem(globalKey) as Translations | null
        if (globalContent) {
          globalTranslations = deepMerge(globalTranslations, globalContent)
        }
      }
      catch (e) {
        if (debug) {
          console.error(`[i18n] Error loading global translations: ${globalKey}`, e)
        }
      }

      // 2. Загрузка переводов страницы: pages/{page}/{locale}.json
      if (page !== 'general') {
        // Нормализуем путь страницы: заменяем слеши на двоеточия для ключа хранилища
        // например "products/slug" -> "products:slug"
        const normalizedPage = fileLookupPage.replace(/\//g, ':')

        const pageKey = `${layerPrefix}:pages:${normalizedPage}:${targetLocale}.json`

        try {
          const pageContent = await storage.getItem(pageKey) as Translations | null
          if (pageContent) {
            pageTranslations = deepMerge(pageTranslations, pageContent)
          }
        }
        catch (e) {
          if (debug) {
            console.error(`[i18n] Error loading page translations: ${pageKey}`, e)
          }
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
