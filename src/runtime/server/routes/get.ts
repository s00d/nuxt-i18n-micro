import { resolve, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import type { Translations, ModuleOptionsExtend, ModulePrivateOptionsExtend } from 'nuxt-i18n-micro-types'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useRuntimeConfig, createError, useStorage } from '#imports'

let storageInit = false

function deepMerge(target: Translations, source: Translations): Translations {
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor') continue

    if (Array.isArray(source[key])) {
      target[key] = source[key]
    }
    else if (source[key] instanceof Object) {
      target[key] = target[key] instanceof Object
        ? deepMerge(target[key] as Translations, source[key] as Translations)
        : source[key]
    }
    else {
      target[key] = source[key]
    }
  }
  return target
}

export default defineEventHandler(async (event) => {
  const { page, locale } = event.context.params as { page: string, locale: string }
  const config = useRuntimeConfig()
  const { rootDirs, debug, translationDir, fallbackLocale, customRegexMatcher } = config.i18nConfig as ModulePrivateOptionsExtend
  const { locales } = config.public.i18nConfig as unknown as ModuleOptionsExtend

  if (customRegexMatcher && locales && !locales.map(l => l.code).includes(locale)) {
    throw createError({ statusCode: 404 })
  }

  const currentLocaleConfig = locales?.find(l => l.code === locale) ?? null

  const getTranslationPath = (locale: string, page: string) =>
    page === 'general' ? `${locale}.json` : `pages/${page}/${locale}.json`

  let translations: Translations = {}
  const serverStorage = useStorage('assets:server')

  if (!storageInit) {
    if (debug) console.log('[nuxt-i18n-micro] clear storage cache')
    await Promise.all((await serverStorage.getKeys('_locales')).map((key: string) => serverStorage.removeItem(key)))
    storageInit = true
  }

  const cacheName = join('_locales', getTranslationPath(locale, page))

  const isThereAsset = await serverStorage.hasItem(cacheName)
  if (isThereAsset) {
    const rawContent = await serverStorage.getItem<Translations | string>(cacheName) ?? {}
    return typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent
  }

  const createPaths = (locale: string) =>
    rootDirs.map(dir => ({
      translationPath: resolve(dir, translationDir!, getTranslationPath(locale, page)),
      name: `_locales/${getTranslationPath(locale, page)}`,
    }))

  const paths = [
    ...(fallbackLocale && fallbackLocale !== locale ? createPaths(fallbackLocale) : []),
    ...(currentLocaleConfig && currentLocaleConfig.fallbackLocale ? createPaths(currentLocaleConfig.fallbackLocale) : []),
    ...createPaths(locale),
  ]

  for (const { translationPath, name } of paths) {
    try {
      if (debug) console.log('[nuxt-i18n-micro] load locale', translationPath, name)

      const content = await readFile(translationPath, 'utf-8')
      const fileContent = JSON.parse(content!) as Translations

      translations = deepMerge(translations, fileContent)
    }
    catch (e) {
      if (debug) console.error('[nuxt-i18n-micro] load locale error', e)
    }
  }

  await serverStorage.setItem(cacheName, translations)

  return translations
})
