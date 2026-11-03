/** The custom HMR event the module's Vite plugin sends when a translation file changes. */
export const TRANSLATIONS_HMR_EVENT = 'i18n-micro:update'

/**
 * Generates the client HMR plugin for translation files.
 *
 * The module's Vite plugin swallows the update of a translation file (no page reload) and sends
 * {@link TRANSLATIONS_HMR_EVENT}; this plugin then reloads the dictionaries from the dev server,
 * which merges the live files the way the build does. `import.meta.hot.accept` on the JSON files
 * cannot do it: nothing imports them, so Vite fell back to a full reload on every edit.
 */
export function generateHmrPlugin(): string {
  return `
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.hot) return
  import.meta.hot.on(${JSON.stringify(TRANSLATIONS_HMR_EVENT)}, () => {
    try {
      nuxtApp.$clearCache()
      console.log('[i18n HMR] Translations reloaded')
    }
    catch (e) {
      console.warn('[i18n HMR] Failed to reload translations', e)
    }
  })
})
`.trim()
}
