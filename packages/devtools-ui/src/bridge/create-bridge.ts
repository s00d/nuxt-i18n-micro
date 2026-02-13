import type { Locale, ModuleOptions } from '@i18n-micro/types'
import type { I18nDevToolsBridge, LocaleData, TranslationContent } from './interface'

/**
 * Adapter interface for accessing i18n instance data
 * Each framework package will implement this adapter for their specific i18n instance
 */
export interface BridgeAdapter {
  /**
   * Get translations cache
   * Keys are in format "locale:routeName" (e.g., "en:index", "en:home")
   */
  getRouteCache: () => Record<string, TranslationContent>

  /**
   * Add or update translations for a locale
   */
  addTranslations: (locale: string, content: TranslationContent, merge: boolean) => void

  /**
   * Add or update route-specific translations
   */
  addRouteTranslations: (locale: string, routeName: string, content: TranslationContent, merge: boolean) => void

  /**
   * Subscribe to changes in translations
   * @returns Unsubscribe function
   */
  subscribe: (callback: () => void) => () => void

  /**
   * Get current locale (optional)
   */
  getCurrentLocale?: () => string

  /**
   * Get fallback locale (optional)
   */
  getFallbackLocale?: () => string
}

export interface CreateBridgeOptions {
  adapter: BridgeAdapter
  locales?: Locale[]
  defaultLocale?: string
  translationDir?: string
}

/**
 * Create a universal bridge for DevTools communication
 * This bridge works with any framework by using an adapter pattern
 */
export function createBridge(options: CreateBridgeOptions): I18nDevToolsBridge {
  const { adapter, locales = [], defaultLocale = 'en', translationDir = 'src/locales' } = options

  // Helper function to build locale data from cache
  const buildLocaleData = (): LocaleData => {
    const data: LocaleData = {}

    // All translations are stored as "locale:routeName" (e.g., "en:index", "en:about")
    const routeCache = adapter.getRouteCache()
    for (const [key, content] of Object.entries(routeCache)) {
      if (!content || typeof content !== 'object' || Array.isArray(content) || Object.keys(content).length === 0) {
        continue
      }

      const separatorIndex = key.indexOf(':')
      if (separatorIndex === -1) {
        continue
      }

      const locale = key.substring(0, separatorIndex)
      const routeName = key.substring(separatorIndex + 1)

      if (routeName === 'index') {
        // Index (root-level) translations -> {locale}.json
        data[`${locale}.json`] = content
      } else {
        // Page-specific translations -> pages/{routeName}/{locale}.json
        data[`pages/${routeName}/${locale}.json`] = content
      }
    }

    return data
  }

  return {
    async getLocalesAndTranslations(): Promise<LocaleData> {
      return buildLocaleData()
    },

    async getConfigs(): Promise<ModuleOptions> {
      return {
        defaultLocale: defaultLocale || adapter.getCurrentLocale?.() || 'en',
        fallbackLocale: adapter.getFallbackLocale?.() || defaultLocale || 'en',
        locales: locales || [],
        translationDir: translationDir || 'locales',
      } as ModuleOptions
    },

    async saveTranslation(filePath: string, content: TranslationContent): Promise<void> {
      try {
        // 1. Update state in memory (Hot Update)
        // Normalize path: remove leading / and extra slashes
        const normalizedPath = filePath.replace(/^\/+/, '').replace(/\/+/g, '/')

        // Parse virtual file path back to locale and route
        const pageMatch = normalizedPath.match(/^pages\/([^/]+)\/([^/]+)\.json$/)

        if (pageMatch) {
          const [, routeName, locale] = pageMatch
          // Update route cache (overwrite, merge = false)
          if (locale && routeName) {
            adapter.addRouteTranslations(locale, routeName, content, false)
          }
        } else {
          // 2. Check for global: {locale}.json
          const globalMatch = normalizedPath.match(/^([^/]+)\.json$/)
          if (globalMatch) {
            const [, locale] = globalMatch
            // Update global cache (overwrite, merge = false)
            if (locale) {
              adapter.addTranslations(locale, content, false)
            }
          } else {
            throw new Error(`Unknown file path format: ${filePath}`)
          }
        }

        // 2. Send request to server to save file to disk
        // Build real path relative to project root
        const realFilePath = translationDir ? `${translationDir}/${normalizedPath}` : normalizedPath

        try {
          const response = await fetch('/__i18n_api/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: realFilePath,
              content,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(errorData.error || `Network response was not ok: ${response.statusText}`)
          }

          console.log(`[i18n-bridge] Saved to disk: ${realFilePath}`)
        } catch (serverError) {
          // Fallback: Save to localStorage if server is unavailable (e.g., in production preview)
          if (typeof localStorage !== 'undefined') {
            console.warn('[i18n-bridge] Server save failed, falling back to localStorage:', serverError)
            const storageKey = `i18n_save_${filePath}`
            localStorage.setItem(storageKey, JSON.stringify(content, null, 2))
          } else {
            // If no server and no localStorage, throw error
            throw serverError
          }
        }
      } catch (error) {
        throw new Error(`Failed to save: ${error instanceof Error ? error.message : String(error)}`)
      }
    },

    onLocalesUpdate(callback: (data: LocaleData) => void): () => void {
      // Subscribe to changes in i18n instance
      const unsubscribe = adapter.subscribe(() => {
        // On any change, rebuild data and send to DevTools
        callback(buildLocaleData())
      })
      return unsubscribe
    },
  }
}
