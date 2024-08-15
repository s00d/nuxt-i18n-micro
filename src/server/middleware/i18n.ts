import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptionsExtend } from '~/src/module'

// Кэш для хранения загруженных переводов
const translationCache: Record<string, Record<string, unknown>> = {}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const i18nOptions: ModuleOptionsExtend = config.public.myModule as ModuleOptionsExtend

  const { locales, defaultLocale, translationDir, rootDir } = i18nOptions

  const url = event.path || ''

  const matchedLocale = locales.find(locale => url === `/${locale}` || url.startsWith(`/${locale}/`)) || defaultLocale

  // Проверяем, есть ли переводы в кэше
  if (!translationCache[matchedLocale]) {
    // Определяем путь к файлу с переводами
    const translationPath = resolve(rootDir!, translationDir, `${matchedLocale}.json`)

    // Загружаем JSON-файл с переводами
    try {
      const fileContent = await readFile(translationPath, 'utf-8')
      translationCache[matchedLocale] = JSON.parse(fileContent)
    }
    catch (error) {
      console.error(`Ошибка загрузки файла перевода: ${translationPath}`, error)
      translationCache[matchedLocale] = {} // Заглушка, если файл не удалось загрузить
    }
  }

  event.context.i18n = {
    locale: matchedLocale,
    translations: translationCache[matchedLocale],
    defaultLocale,
    locales,
  }
})
