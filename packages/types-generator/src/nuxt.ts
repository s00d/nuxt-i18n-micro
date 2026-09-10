import { addTypeTemplate, defineNuxtModule } from '@nuxt/kit'
import { getTypesString } from './core/generator'

export interface I18nTypesGeneratorOptions {
  /** Translation directory relative to the project root. Defaults to `i18n.translationDir` or `'locales'`. */
  translationDir?: string
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
    // translationDir from module options or from nuxt-i18n-micro options (i18n config in #build/i18n.config.mjs and i18n.strategy.mjs)
    const mainModuleI18n = (nuxt.options as { i18n?: { translationDir?: string } }).i18n
    const translationDir = options.translationDir || mainModuleI18n?.translationDir || 'locales'

    // Legacy key from older docs — not part of the public Nuxt options type.
    const legacyOutputFile = (options as Record<string, unknown>).outputFile
    if (typeof legacyOutputFile === 'string' && legacyOutputFile.length > 0) {
      console.warn('[i18n-types] `i18nTypes.outputFile` is ignored in Nuxt; generated types are written to `.nuxt/types/i18n-micro.d.ts`.')
    }

    // Keep augmentation resolving under pnpm even if this module loads before nuxt-i18n-micro.
    nuxt.options.typescript.hoist ||= []
    if (!nuxt.options.typescript.hoist.includes('@i18n-micro/types')) {
      nuxt.options.typescript.hoist.push('@i18n-micro/types')
    }

    const filename = 'types/i18n-micro.d.ts'

    // 1. Use addTypeTemplate for automatic connection to the TypeScript context
    // This will automatically add a reference in .nuxt/nuxt.d.ts
    addTypeTemplate({
      filename,
      getContents: async () => {
        try {
          // Generate types directly into a string (without writing a file)
          return await getTypesString({
            srcDir: nuxt.options.rootDir,
            translationDir,
          })
        } catch (error) {
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
        // Regenerate types via builder:generateApp
        // This will trigger getContents on addTypeTemplate
        await nuxt.callHook('builder:generateApp')
      }
    })
  },
})
