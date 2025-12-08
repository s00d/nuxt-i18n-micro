import type { I18nDevToolsBridge, LocaleData, TranslationContent } from '@i18n-micro/devtools-ui'
import type { ModuleOptions } from '@i18n-micro/types'

const RPC_NAMESPACE = 'nuxt-i18n-micro'

/**
 * Create a Nuxt RPC bridge that adapts Nuxt DevTools RPC to I18nDevToolsBridge interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createNuxtBridge(client: any): I18nDevToolsBridge {
  const rpc = client.devtools.extendClientRpc(RPC_NAMESPACE, {
    localesUpdated(_updatedLocales: LocaleData) {
      // This will be handled by the bridge's onLocalesUpdate callback
    },
  })

  return {
    async getLocalesAndTranslations(): Promise<LocaleData> {
      console.log('[i18n-devtools] Bridge: getLocalesAndTranslations called')
      try {
        const result = await rpc.getLocalesAndTranslations()
        console.log('[i18n-devtools] Bridge: getLocalesAndTranslations result', { count: Object.keys(result).length })
        return result
      }
      catch (error) {
        console.error('[i18n-devtools] Bridge: getLocalesAndTranslations error', error)
        throw error
      }
    },

    async getConfigs(): Promise<ModuleOptions> {
      console.log('[i18n-devtools] Bridge: getConfigs called')
      try {
        const result = await rpc.getConfigs()
        console.log('[i18n-devtools] Bridge: getConfigs result', result)
        return result
      }
      catch (error) {
        console.error('[i18n-devtools] Bridge: getConfigs error', error)
        throw error
      }
    },

    async saveTranslation(filePath: string, content: TranslationContent): Promise<void> {
      await rpc.saveTranslationContent(filePath, content)
    },

    onLocalesUpdate(callback: (data: LocaleData) => void): () => void {
      // Subscribe to locales updates via RPC
      rpc.localesUpdated = callback

      // Return unsubscribe function
      return () => {
        rpc.localesUpdated = undefined
      }
    },
  }
}
