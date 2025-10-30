import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler, setResponseHeader } from 'h3'
import type { Translations, ModuleOptionsExtend, ModulePrivateOptionsExtend } from 'nuxt-i18n-micro-types'
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

async function readTranslationFile(filePath: string, debug: boolean): Promise<Translations | null> {
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as Translations
  }
  catch (e) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (debug && e?.code !== 'ENOENT') {
      console.error(`[i18n] Error loading locale file: ${filePath}`, e)
    }
    return null
  }
}

export default defineEventHandler(async (event) => {
  // Set proper Content-Type header for JSON responses
  setResponseHeader(event, 'Content-Type', 'application/json')

  const { page, locale } = event.context.params as { page: string, locale: string }
  const config = useRuntimeConfig()
  const { rootDirs, debug, translationDir, fallbackLocale, routesLocaleLinks } = config.i18nConfig as ModulePrivateOptionsExtend
  const { locales } = config.public.i18nConfig as unknown as ModuleOptionsExtend

  // Always validate locale against configured locales to avoid serving data for invalid or disabled locales
  if (locales && !locales.map(l => l.code).includes(locale)) {
    throw createError({ statusCode: 404 })
  }

  // Определяем имя страницы, по которому ищем файл перевода
  let fileLookupPage = page
  if (routesLocaleLinks && (routesLocaleLinks as Record<string, string>)[page]) {
    fileLookupPage = (routesLocaleLinks as Record<string, string>)[page]
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

  const getPathsFor = (targetLocale: string, targetPage: string) =>
    rootDirs.map(dir => resolve(dir, translationDir!, targetPage === 'general' ? `${targetLocale}.json` : `pages/${targetPage}/${targetLocale}.json`))

  let finalTranslations: Translations = {}
  const currentLocaleConfig = locales?.find(l => l.code === locale) ?? null

  const loadAndMerge = async (targetLocale: string) => {
    let globalTranslations: Translations = {}
    let pageTranslations: Translations = {}

    for (const p of getPathsFor(targetLocale, 'general')) {
      const content = await readTranslationFile(p, debug)
      if (content) globalTranslations = deepMerge(globalTranslations, content)
    }
    if (page !== 'general') {
      for (const p of getPathsFor(targetLocale, fileLookupPage)) {
        const content = await readTranslationFile(p, debug)
        if (content) pageTranslations = deepMerge(pageTranslations, content)
      }
    }
    return deepMerge(globalTranslations, pageTranslations)
  }

  const fallbackLocalesList = [
    fallbackLocale,
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
