export interface GenerateHmrPluginOptions {
  /** Absolute paths of top-level additional `{locale}.json` files: watched like the primary ones. */
  additionalRootFiles?: string[]
}

/**
 * Generates the client HMR plugin for translation files.
 *
 * Any accepted change reloads the current page's dictionary from the dev server, which merges
 * the live files the same way the build does. Patching the client chunk in place could not:
 * a root file feeds every page (and other locales through fallbacks), and a merge never drops
 * a key that was deleted from the file.
 */
export function generateHmrPlugin(files: string[], options: GenerateHmrPluginOptions = {}): string {
  const watched = [...new Set([...files, ...(options.additionalRootFiles ?? [])].map((f) => f.replace(/\\/g, '/')))]
  if (watched.length === 0) return `import { defineNuxtPlugin } from '#imports'\nexport default defineNuxtPlugin(() => {})`

  // JSON.stringify: a path with quotes or backslashes stays a valid string literal
  return `
import { defineNuxtPlugin, useNuxtApp } from '#imports'

export default defineNuxtPlugin(() => {
  if (!import.meta.hot) return
  import.meta.hot.accept(${JSON.stringify(watched)}, () => {
    try {
      useNuxtApp().$clearCache()
      console.log('[i18n HMR] Translations reloaded')
    }
    catch (e) {
      console.warn('[i18n HMR] Failed to reload translations', e)
    }
  })
})
`.trim()
}
