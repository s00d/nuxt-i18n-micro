import type { I18nDevToolsBridge, LocaleData, TranslationContent } from '@i18n-micro/devtools-ui'
import type { ModuleOptions } from '@i18n-micro/types'

const RPC_NAMESPACE = 'nuxt-i18n-micro'

/**
 * Create a Nuxt RPC bridge that adapts Nuxt DevTools RPC to I18nDevToolsBridge interface
 */
export function createNuxtBridge(client: any): I18nDevToolsBridge {
  const listeners = new Set<(data: LocaleData) => void>()
  const rpc = client.devtools.extendClientRpc(RPC_NAMESPACE, {
    // what the server calls when a translation file changes
    localesUpdated(updatedLocales: LocaleData) {
      for (const listener of [...listeners]) listener(updatedLocales)
    },
  })

  return {
    getLocalesAndTranslations: (): Promise<LocaleData> => rpc.getLocalesAndTranslations(),

    getConfigs: (): Promise<ModuleOptions> => rpc.getConfigs(),

    async saveTranslation(filePath: string, content: TranslationContent): Promise<void> {
      await rpc.saveTranslationContent(filePath, content)
    },

    onLocalesUpdate(callback: (data: LocaleData) => void): () => void {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
  }
}
