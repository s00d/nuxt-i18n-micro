import type { I18nDevToolsBridge, LocaleData, TranslationContent } from '@i18n-micro/devtools-ui'
import type { ModuleOptions } from '@i18n-micro/types'

/**
 * Astro Toolbar Server interface (simplified)
 */
export interface AstroToolbarServer {
  send(event: string, data?: unknown): void
  on(event: string, callback: (data: unknown) => void): void
  off(event: string, callback: (data: unknown) => void): void
}

interface SaveResult {
  success: boolean
  error?: string
}

/**
 * Create an Astro Toolbar bridge that adapts Astro Toolbar Server API to I18nDevToolsBridge interface
 */
export function createAstroBridge(server: AstroToolbarServer): I18nDevToolsBridge {
  return {
    async getLocalesAndTranslations(): Promise<LocaleData> {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          server.off('i18n:locales-data', handler)
          reject(new Error('Timeout waiting for locales data'))
        }, 10000)

        const handler = (data: unknown) => {
          clearTimeout(timeout)
          server.off('i18n:locales-data', handler)
          console.log('[i18n-bridge] Raw received data type:', typeof data, 'is object:', typeof data === 'object', 'is array:', Array.isArray(data))
          console.log('[i18n-bridge] Raw data:', data)

          // Убедимся, что данные правильно преобразованы
          let localesData: LocaleData
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            localesData = data as LocaleData
          }
          else {
            console.error('[i18n-bridge] Invalid data format:', data)
            localesData = {} as LocaleData
          }

          console.log('[i18n-bridge] Received locales data:', Object.keys(localesData).length, 'files')
          console.log('[i18n-bridge] Locales keys:', Object.keys(localesData))
          if (Object.keys(localesData).length > 0) {
            const firstKey = Object.keys(localesData)[0]
            if (firstKey) {
              const firstContent = localesData[firstKey]
              console.log('[i18n-bridge] First file content type:', typeof firstContent)
              console.log('[i18n-bridge] First file content:', firstContent)
              console.log('[i18n-bridge] First file content keys:', firstContent && typeof firstContent === 'object' ? Object.keys(firstContent as Record<string, unknown>).slice(0, 5) : 'not an object')
            }
            // Проверяем, что данные действительно объекты
            const isValid = Object.values(localesData).every(v => v && typeof v === 'object' && !Array.isArray(v))
            console.log('[i18n-bridge] All values are valid objects:', isValid)
          }
          // Убедимся, что возвращаем правильный формат
          const result: LocaleData = {}
          for (const [key, value] of Object.entries(localesData)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              result[key] = value as TranslationContent
            }
          }
          console.log('[i18n-bridge] Resolving with', Object.keys(result).length, 'valid files')
          resolve(result)
        }
        server.on('i18n:locales-data', handler)
        console.log('[i18n-bridge] Requesting locales data...')
        server.send('i18n:get-locales', {})
      })
    },

    async getConfigs(): Promise<ModuleOptions> {
      return new Promise((resolve) => {
        const handler = (data: unknown) => {
          server.off('i18n:configs-data', handler)
          resolve(data as ModuleOptions)
        }
        server.on('i18n:configs-data', handler)
        server.send('i18n:get-configs', {})
      })
    },

    async saveTranslation(filePath: string, content: TranslationContent): Promise<void> {
      return new Promise((resolve, reject) => {
        const handler = (data: unknown) => {
          server.off('i18n:save-result', handler)
          const result = data as SaveResult
          if (result.success) {
            resolve()
          }
          else {
            reject(new Error(result.error || 'Failed to save translation'))
          }
        }
        server.on('i18n:save-result', handler)
        server.send('i18n:save', { file: filePath, content })
      })
    },

    onLocalesUpdate(callback: (data: LocaleData) => void): () => void {
      const handler = (data: unknown) => {
        callback(data as LocaleData)
      }
      server.on('i18n:updated', handler)
      return () => {
        server.off('i18n:updated', handler)
      }
    },
  }
}
