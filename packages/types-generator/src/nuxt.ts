import { existsSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import { isInsideDir } from '@i18n-micro/utils/load-dir'
import { addTypeTemplate, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { getTypesString } from './core/generator'

export interface I18nTypesGeneratorOptions {
  /** Translation directory relative to the project root. Defaults to where `nuxt-i18n-micro` reads translations. */
  translationDir?: string
}

interface I18nDirOptions {
  translationDir?: string
  additionalTranslationDirs?: string[]
}

/** The module's options: under `i18n`, or inline in `modules: [['nuxt-i18n-micro', { … }]]`. */
function i18nOptions(nuxt: Nuxt): I18nDirOptions {
  const inline = nuxt.options.modules.find((entry) => Array.isArray(entry) && String(entry[0]).includes('nuxt-i18n-micro'))
  return { ...(inline as [unknown, I18nDirOptions] | undefined)?.[1], ...(nuxt.options as { i18n?: I18nDirOptions }).i18n }
}

/** Where the module reads translations: the folder and the additional dirs, each in every layer. */
function translationDirs(nuxt: Nuxt, own?: string): { dirs: string[]; additionalDirs: string[] } {
  if (own) return { dirs: [resolve(nuxt.options.rootDir, own)], additionalDirs: [] }
  const { translationDir = 'locales', additionalTranslationDirs = [] } = i18nOptions(nuxt)
  const roots = nuxt.options._layers.map((layer) => layer.config.rootDir)
  return {
    dirs: roots.map((root) => join(root, translationDir)),
    // most layers have no such folder, and that is no warning
    additionalDirs: additionalTranslationDirs.flatMap((dir) => roots.map((root) => resolve(root, dir))).filter((dir) => existsSync(dir)),
  }
}

export default defineNuxtModule<I18nTypesGeneratorOptions>({
  meta: {
    name: '@i18n-micro/types-generator',
    configKey: 'i18nTypes',
  },
  setup(options, nuxt) {
    const { dirs, additionalDirs } = translationDirs(nuxt, options.translationDir)

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

    addTypeTemplate({
      filename: 'types/i18n-micro.d.ts',
      getContents: () => {
        try {
          return getTypesString({ srcDir: nuxt.options.rootDir, translationDir: dirs, additionalDirs })
        } catch (error) {
          console.warn('[i18n-types] Failed to generate types:', error)
          return `// Failed to generate types: ${error instanceof Error ? error.message : String(error)}`
        }
      },
    })

    // `builder:generateApp` runs `getContents` again
    nuxt.hook('builder:watch', async (_event, path) => {
      const file = isAbsolute(path) ? path : join(nuxt.options.srcDir, path)
      if (file.endsWith('.json') && [...dirs, ...additionalDirs].some((dir) => isInsideDir(file, dir))) await nuxt.callHook('builder:generateApp')
    })
  },
})
