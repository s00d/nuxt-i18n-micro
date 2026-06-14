/**
 * Generates the HMR plugin source code for hot-reloading translation files.
 */
export function generateHmrPlugin(files: string[]): string {
  const accepts = files
    .map((file) => {
      const isPage = /\/pages\//.test(file)
      let pageName = ''
      let locale = ''
      if (isPage) {
        const m = /\/pages\/(.+)\/([^/]+)\.json$/.exec(file)
        pageName = m?.[1] || ''
        locale = m?.[2] || ''
      } else {
        const m = /\/([^/]+)\.json$/.exec(file)
        locale = m?.[1] || ''
        pageName = 'index'
      }

      return `
if (import.meta.hot) {
  import.meta.hot.accept('${file}', async (mod) => {
    const nuxtApp = useNuxtApp()
    const data = (mod && typeof mod === 'object' && Object.prototype.hasOwnProperty.call(mod, 'default'))
      ? mod.default
      : mod
    try {
      await nuxtApp.$loadPageTranslations('${locale}', '${pageName}', data)
      console.log('[i18n HMR] Translations reloaded:', '${isPage ? 'page' : 'global'}', '${locale}'${isPage ? `, '${pageName}'` : ''})
    }
    catch (e) {
      console.warn('[i18n HMR] Failed to reload translations for', '${file}', e)
    }
  })
}
`.trim()
    })
    .join('\n')

  return `
import { defineNuxtPlugin, useNuxtApp } from '#imports'

export default defineNuxtPlugin(() => {
${accepts}
})
`.trim()
}
