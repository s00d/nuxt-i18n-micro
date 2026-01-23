import { createUnplugin } from 'unplugin'
import { generateTypes, type GeneratorOptions } from './core/generator'
import chokidar from 'chokidar'
import { resolve } from 'node:path'

let watcher: chokidar.FSWatcher | null = null
let generateTimeout: NodeJS.Timeout | null = null

function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      if (generateTimeout) clearTimeout(generateTimeout)
      generateTimeout = null
      func(...args)
    }

    if (generateTimeout) clearTimeout(generateTimeout)
    generateTimeout = setTimeout(later, wait)
  }
}

export const I18nTypesPlugin = createUnplugin((options: GeneratorOptions) => {
  return {
    name: 'i18n-micro-types-generator',
    async buildStart() {
      // Initial generation
      try {
        await generateTypes(options)
      }
      catch (error) {
        console.warn('[i18n-types] Failed to generate types:', error)
      }

      // In dev mode start watcher
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        const localesDir = resolve(options.srcDir, options.translationDir)

        // Debounced function for regeneration
        const debouncedGenerate = debounce(async () => {
          try {
            await generateTypes(options)
          }
          catch (error) {
            console.warn('[i18n-types] Failed to regenerate types:', error)
          }
        }, 300)

        watcher = chokidar.watch(localesDir, {
          ignoreInitial: true,
          ignored: ['node_modules/**', 'dist/**', '.nuxt/**'],
        })

        watcher.on('all', async (_event, path) => {
          if (path.endsWith('.json')) {
            debouncedGenerate()
          }
        })
      }
    },
    buildEnd() {
      // Stop watcher when build ends
      if (watcher) {
        watcher.close()
        watcher = null
      }
      if (generateTimeout) {
        clearTimeout(generateTimeout)
        generateTimeout = null
      }
    },
  }
})
