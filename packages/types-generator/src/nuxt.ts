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
    // Get translationDir from module options or from runtimeConfig
    // Use safe access to runtimeConfig as types may not be fully defined
    const publicConfig = nuxt.options.runtimeConfig?.public as Record<string, unknown> | undefined
    const runtimeConfigI18n = publicConfig?.i18nConfig as { translationDir?: string } | undefined
    const translationDir = options.translationDir
      || runtimeConfigI18n?.translationDir
      || 'locales'

    const filename = 'types/i18n-micro.d.ts'

    // 1. Use addTypeTemplate for automatic connection to TypeScript context
    // This will automatically add reference to .nuxt/nuxt.d.ts
    addTypeTemplate({
      filename,
      getContents: async () => {
        try {
          // Generate types directly to string (without writing file)
          return await getTypesString({
            srcDir: nuxt.options.rootDir,
            translationDir,
          })
        }
        catch (error) {
          console.warn('[i18n-types] Failed to generate types:', error)
          // Return empty file in case of error
          return `// Failed to generate types: ${error instanceof Error ? error.message : String(error)}`
        }
      },
    })

    // 2. Watcher for automatic regeneration when translation files change
    nuxt.hook('builder:watch', async (_event, path) => {
      // Normalize paths for Windows (globby returns /, but path can be \)
      const normalizedPath = path.replace(/\\/g, '/')
      const normalizedTranslationDir = translationDir.replace(/\\/g, '/')

      if (normalizedPath.includes(normalizedTranslationDir) && normalizedPath.endsWith('.json')) {
        // Regenerate types through builder:generateApp
        // This will call getContents from addTypeTemplate
        await nuxt.callHook('builder:generateApp')
      }
    })
  },
})
