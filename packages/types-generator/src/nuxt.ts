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
    // Получаем translationDir из опций модуля или из runtimeConfig
    // Используем безопасный доступ к runtimeConfig, так как типы могут быть не полностью определены
    const publicConfig = nuxt.options.runtimeConfig?.public as Record<string, unknown> | undefined
    const runtimeConfigI18n = publicConfig?.i18nConfig as { translationDir?: string } | undefined
    const translationDir = options.translationDir
      || runtimeConfigI18n?.translationDir
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
