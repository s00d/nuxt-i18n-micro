import { defineNuxtModule, addTypeTemplate } from '@nuxt/kit'
import { getTypesString } from './core/generator'

export interface I18nTypesGeneratorOptions {
  translationDir?: string
  outputFile?: string
}

export default defineNuxtModule<I18nTypesGeneratorOptions>({
  meta: {
    name: '@i18n-micro/types-generator',
    configKey: 'i18nTypes',
  },
  defaults: {
    translationDir: 'locales',
  },
  async setup(options, nuxt) {
    // translationDir из опций модуля или из опций nuxt-i18n-micro (конфиг i18n в #build/i18n.config.mjs и i18n.strategy.mjs)
    const mainModuleI18n = (nuxt.options as { i18n?: { translationDir?: string } }).i18n
    const translationDir = options.translationDir
      || mainModuleI18n?.translationDir
      || 'locales'

    const filename = 'types/i18n-micro.d.ts'

    // 1. Используем addTypeTemplate для автоматического подключения к TypeScript контексту
    // Это автоматически добавит reference в .nuxt/nuxt.d.ts
    addTypeTemplate({
      filename,
      getContents: async () => {
        try {
          // Генерируем типы напрямую в строку (без записи файла)
          return await getTypesString({
            srcDir: nuxt.options.rootDir,
            translationDir,
          })
        }
        catch (error) {
          console.warn('[i18n-types] Failed to generate types:', error)
          // Возвращаем пустой файл в случае ошибки
          return `// Failed to generate types: ${error instanceof Error ? error.message : String(error)}`
        }
      },
    })

    // 2. Watcher для автоматической регенерации при изменении файлов переводов
    nuxt.hook('builder:watch', async (_event, path) => {
      // Нормализуем пути для Windows (globby возвращает /, но path может быть \)
      const normalizedPath = path.replace(/\\/g, '/')
      const normalizedTranslationDir = translationDir.replace(/\\/g, '/')

      if (normalizedPath.includes(normalizedTranslationDir) && normalizedPath.endsWith('.json')) {
        // Регенерируем типы через builder:generateApp
        // Это вызовет getContents у addTypeTemplate
        await nuxt.callHook('builder:generateApp')
      }
    })
  },
})
