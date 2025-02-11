import { resolve, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import type { Translations, ModuleOptionsExtend, ModulePrivateOptionsExtend } from 'nuxt-i18n-micro-types'
import { loadYaml } from '../utils/load-yaml'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useRuntimeConfig, createError, useStorage } from '#imports'

let storageInit = false

function deepMerge(target: Translations, source: Translations): Translations {
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor') {
      continue
    }

    if (source[key] === undefined) {
      continue
    }

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

async function loadTranslations(rootDirs: string[], translationDir: string, locale: string, page: string): Promise<Translations> {
  const getTranslationPath = (locale: string, page: string) =>
    page === 'general' ? `${locale}` : `pages/${page}/${locale}`

  let translations: Translations = {}

  const createPaths = (locale: string, ext: string) =>
    rootDirs.map(dir => ({
      translationPath: resolve(dir, translationDir!, `${getTranslationPath(locale, page)}${ext}`),
      name: `_locales/${getTranslationPath(locale, page)}${ext}`,
    }))

  const extensions = ['.json', '.yaml', '.yml']
  const paths = extensions.flatMap(ext => createPaths(locale, ext))

  for (const { translationPath } of paths) {
    try {
      const content = await readFile(translationPath, 'utf-8')
      let fileContent: Translations = {}

      if (translationPath.endsWith('.json')) {
        fileContent = JSON.parse(content) as Translations
      }
      else if (translationPath.endsWith('.yaml') || translationPath.endsWith('.yml')) {
        fileContent = await loadYaml(translationPath) as Translations
      }

      translations = deepMerge(translations, fileContent)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (e) {
      // We ignore the error here, as it just means that the file doesn't exist which is fine
      // console.error('[nuxt-i18n-micro] load locale error', e)
    }
  }

  return translations
}

export default defineEventHandler(async (event) => {
  const { page, locale } = event.context.params as { page: string, locale: string }
  const config = useRuntimeConfig()
  const { rootDirs, debug, translationDir, customRegexMatcher } = config.i18nConfig as ModulePrivateOptionsExtend
  const { locales } = config.public.i18nConfig as unknown as ModuleOptionsExtend

  if (customRegexMatcher && locales && !locales.map(l => l.code).includes(locale)) {
    throw createError({ statusCode: 404 })
  }

  const serverStorage = useStorage('assets:server')

  if (!storageInit) {
    if (debug) {
      console.log('[nuxt-i18n-micro] clear storage cache')
    }
    await Promise.all((await serverStorage.getKeys('_locales')).map((key: string) => serverStorage.removeItem(key)))
    storageInit = true
  }

  const cacheName = join('_locales', `${locale}-${page}`)

  const isThereAsset = await serverStorage.hasItem(cacheName)
  let translations: Translations = {}

  if (isThereAsset) {
    const rawContent = await serverStorage.getItem<Translations | string>(cacheName) ?? {}
    translations = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent
  }
  else {
    translations = await loadTranslations(rootDirs, translationDir!, locale, page)
    await serverStorage.setItem(cacheName, translations)
  }

  return translations
})
