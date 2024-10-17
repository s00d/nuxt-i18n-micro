import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import type { ModuleOptionsExtend, ModulePrivateOptionsExtend } from '../../../types'
import type { Translations } from '../../plugins/01.plugin'
import { useRuntimeConfig, createError } from '#imports'

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
  const { rootDirs } = config.i18nConfig as ModulePrivateOptionsExtend
  const { translationDir, fallbackLocale, customRegexMatcher, locales } = config.public.i18nConfig as ModuleOptionsExtend

  console.log(555, translationDir)

  if (customRegexMatcher && locales && !locales.map(l => l.code).includes(locale)) {
    // return 404 if route not matching route
    throw createError({
      statusCode: 404,
    })
  }
  const getTranslationPath = (locale: string, page: string) => {
    return page === 'general' ? `${locale}.json` : `pages/${page}/${locale}.json`
  }

  const paths: string[] = []
  if (fallbackLocale && fallbackLocale !== locale) {
    rootDirs.forEach((dir) => {
      paths.push(resolve(dir, 'dist', translationDir!, getTranslationPath(fallbackLocale, page)))
      paths.push(resolve(dir, translationDir!, getTranslationPath(fallbackLocale, page)))
    })
  }
  rootDirs.forEach((dir) => {
    paths.push(resolve(dir, 'dist', translationDir!, getTranslationPath(locale, page)))
    paths.push(resolve(dir, translationDir!, getTranslationPath(locale, page)))
  })

  let translations: Translations = {}

  // Чтение и мержинг файлов переводов
  for (const translationPath of paths) {
    try {
      const fileContent = await readFile(translationPath, 'utf-8')
      const content = JSON.parse(fileContent) as Translations

      // Если translations пустой, просто присваиваем значение
      if (isEmptyObject(translations)) {
        translations = content
      }
      else {
        // Иначе выполняем глубокое слияние
        translations = deepMerge(translations, content)
      }
    }
    catch {
      // Игнорируем ошибки чтения файлов, продолжаем с оставшимися
    }
  }

  return translations
})
