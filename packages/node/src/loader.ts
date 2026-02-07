import { readdir, readFile } from 'node:fs/promises'
import { basename, join, relative, sep } from 'node:path'
import type { Translations } from '@i18n-micro/types'

export interface LoadedTranslations {
  global: Record<string, Translations>
  routes: Record<string, Record<string, Translations>>
}

/**
 * Load translations from a directory
 * Supports both flat structure (locales/{lang}.json) and nested structure (locales/pages/{page}/{lang}.json)
 * @param dir - Directory path containing translation files
 * @param disablePageLocales - If true, ignores pages/ folder and treats all files as global translations
 * @returns Object with global and route-specific translations
 */
export async function loadTranslations(dir: string, disablePageLocales: boolean = false): Promise<LoadedTranslations> {
  const result: LoadedTranslations = {
    global: {},
    routes: {},
  }

  try {
    // Используем рекурсивное чтение директории (Node.js 20+)
    const files = await readdir(dir, { recursive: true, withFileTypes: true })

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.json')) {
        continue
      }

      const fullPath = join(file.path, file.name)
      // Вычисляем путь относительно корня локалей
      const relativePath = relative(dir, fullPath)
      const parts = relativePath.split(sep)
      const locale = basename(file.name, '.json')

      try {
        const content = await readFile(fullPath, 'utf-8')
        const translations = JSON.parse(content) as Translations

        // Логика определения типа файла (глобальный или страничный)
        if (!disablePageLocales && parts[0] === 'pages' && parts.length >= 2) {
          // Это страница.
          // Пример: pages/user/profile/en.json
          // parts: ['pages', 'user', 'profile', 'en.json']
          // routeParts: ['user', 'profile'] -> 'user-profile'

          const routeParts = parts.slice(1, -1)
          if (routeParts.length > 0) {
            const routeName = routeParts.join('-')

            if (!result.routes[routeName]) {
              result.routes[routeName] = {}
            }
            result.routes[routeName][locale] = translations
          }
        } else {
          // Это глобальный файл (в корне или если disablePageLocales=true)
          // Пример: en.json или pages/en.json (если disablePageLocales=true)
          result.global[locale] = translations
        }
      } catch (error) {
        console.error(`Failed to load translation file ${fullPath}:`, error)
      }
    }
  } catch (error) {
    // Если папки нет, просто возвращаем пустой результат, чтобы не крашить приложение
    // (или можно прокидывать ошибку выше, если это критично)
    if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
      console.error(`Failed to read directory ${dir}:`, error)
    }
  }

  return result
}

/**
 * Load only global translations from a directory
 * @param dir - Directory path containing translation files
 * @param disablePageLocales - If true, ignores pages/ folder and treats all files as global translations
 */
export async function loadGlobalTranslations(dir: string, disablePageLocales: boolean = false): Promise<Record<string, Translations>> {
  const { global } = await loadTranslations(dir, disablePageLocales)
  return global
}
