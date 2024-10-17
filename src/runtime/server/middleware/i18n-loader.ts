import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import type { ModuleOptionsExtend, ModulePrivateOptionsExtend } from '../../../types'
import type { Translations } from '../../plugins/01.plugin'
import { useRuntimeConfig, createError, useStorage } from '#imports'

// Рекурсивная функция для глубокого слияния объектов
function deepMerge(target: Translations, source: Translations): Translations {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor') {
      continue
    }
    if (Array.isArray(source[key])) {
      // Если значение — массив, берём массив из source
      target[key] = source[key]
    }
    else if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key] as Translations, source[key] as Translations))
    }
  }
  // Сливаем объекты на верхнем уровне
  return { ...target, ...source }
}

function isEmptyObject(obj: Translations): boolean {
  for (const _ in obj) {
    return false
  }
  return true
}

export default defineEventHandler(async (event) => {
  const { page, locale } = event.context.params as { page: string, locale: string }
  const config = useRuntimeConfig()
  const { rootDirs, debug } = config.i18nConfig as ModulePrivateOptionsExtend
  const { translationDir, fallbackLocale, customRegexMatcher, locales } = config.public.i18nConfig as ModuleOptionsExtend

  if (customRegexMatcher && locales && !locales.map(l => l.code).includes(locale)) {
    // return 404 if route not matching route
    throw createError({
      statusCode: 404,
    })
  }
  const getTranslationPath = (locale: string, page: string) => {
    return page === 'general' ? `${locale}.json` : `pages/${page}/${locale}.json`
  }

  const paths: { translationPath: string, name: string }[] = []
  if (fallbackLocale && fallbackLocale !== locale) {
    rootDirs.forEach((dir) => {
      paths.push({
        translationPath: resolve(dir, translationDir!, getTranslationPath(fallbackLocale, page)),
        name: `_locales/${getTranslationPath(fallbackLocale, page)}`,
      })
    })
  }
  rootDirs.forEach((dir) => {
    paths.push({
      translationPath: resolve(dir, translationDir!, getTranslationPath(locale, page)),
      name: `_locales/${getTranslationPath(locale, page)}`,
    })
  })

  let translations: Translations = {}
  const serverStorage = await useStorage('assets:server')

  // Чтение и мержинг файлов переводов
  for (const { translationPath, name } of paths) {
    try {
      if (debug) {
        console.log('[nuxt-i18n-micro] load locale', translationPath, name)
      }
      // check if it exists in server assets
      const isThereAsset = await serverStorage.hasItem(name)
      // we prefer server assets storage when in production
      // if in dev ore while prerendering we fetch from user content
      const fileContent = (isThereAsset && !import.meta.prerender) ? await serverStorage.getItemRaw<string>(name) : await readFile(translationPath, 'utf-8')
      const content = JSON.parse(fileContent!) as Translations
      if (!isThereAsset && import.meta.prerender) {
        // write to server assets while building
        await serverStorage.setItem(name, fileContent)
      }
      // Если translations пустой, просто присваиваем значение
      if (isEmptyObject(translations)) {
        translations = content
      }
      else {
        // Иначе выполняем глубокое слияние
        translations = deepMerge(translations, content)
      }
    }
    catch (e) {
      if (debug) {
        console.error('[nuxt-i18n-micro] load locale error', e)
      }
    }
  }

  return translations
})
