import { resolve, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import { globby } from 'globby'
import type { Translations, ModuleOptionsExtend, ModulePrivateOptionsExtend } from 'nuxt-i18n-micro-types'
import { loadYaml } from '../utils/load-yaml'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useRuntimeConfig, createError, useStorage } from '#imports'

let storageInit = false

function deepMerge(target: Translations, source: Translations): Translations {
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor') continue

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
    page === 'general' ? `${locale}.json` : `pages/${page}/${locale}.json`

  let translations: Translations = {}

  const createPaths = (locale: string) =>
    rootDirs.map(dir => ({
      translationPath: resolve(dir, translationDir!, getTranslationPath(locale, page)),
      name: `_locales/${getTranslationPath(locale, page)}`,
    }))

  const paths = [createPaths(locale)[0]]

  for (const { translationPath } of paths) {
    try {
      const content = await readFile(translationPath, 'utf-8')
      const fileContent = JSON.parse(content!) as Translations

      translations = deepMerge(translations, fileContent)
    }
    catch (e) {
      console.error('[nuxt-i18n-micro] load locale error', e)
    }
  }

  return translations
}

async function loadYamlTranslations(rootDirs: string[], translationDir: string, locale: string, page: string): Promise<Translations> {
  const getTranslationPath = (locale: string, page: string) => {
    return page === 'general' ? `${locale}` : `pages/${page}/${locale}`
  }

  let translations: Translations = {}
  const baseDir = resolve(rootDirs[0], translationDir!)
  const yamlFiles = await globby([`**/${getTranslationPath(locale, page)}.yaml`, `**/${getTranslationPath(locale, page)}.yml`], { cwd: baseDir })

  for (const file of yamlFiles) {
    try {
      const filePath = resolve(baseDir, file)
      console.log('[nuxt-i18n-micro] load yaml locale', filePath)
      const fileContent = await loadYaml(filePath) as Translations
      if (fileContent) {
        translations = deepMerge(translations, fileContent)
      }
    }
    catch (e) {
      console.error('[nuxt-i18n-micro] load yaml locale error', e)
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

  let translations: Translations = {}
  const serverStorage = useStorage('assets:server')

  if (!storageInit) {
    if (debug) console.log('[nuxt-i18n-micro] clear storage cache')
    await Promise.all((await serverStorage.getKeys('_locales')).map((key: string) => serverStorage.removeItem(key)))
    storageInit = true
  }

  const cacheName = join('_locales', `${locale}-${page}`)

  const isThereAsset = await serverStorage.hasItem(cacheName)
  if (isThereAsset) {
    const rawContent = await serverStorage.getItem<Translations | string>(cacheName) ?? {}
    translations = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent
  }
  else {
    const jsonTranslations = await loadTranslations(rootDirs, translationDir!, locale, page)
    const yamlTranslations = await loadYamlTranslations(rootDirs, translationDir!, locale, page)

    translations = deepMerge(jsonTranslations, yamlTranslations)
    await serverStorage.setItem(cacheName, translations)
  }

  return translations
})
