import type { I18nDevToolsBridge, LocaleData, TranslationContent } from '@i18n-micro/devtools-ui'
import type { ModuleOptions, Locale } from '@i18n-micro/types'
import type { VueI18n } from '../../composer'

export interface VueBridgeOptions {
  i18n: VueI18n
  locales?: Locale[]
  defaultLocale?: string
  translationDir?: string
}

/**
 * Create a Vue bridge that adapts VueI18n API to I18nDevToolsBridge interface
 * Creates a virtual file system structure: locales/{lang}.json and locales/pages/{route}/{lang}.json
 */
export function createVueBridge(options: VueBridgeOptions): I18nDevToolsBridge {
  const { i18n, locales = [], defaultLocale = 'en', translationDir } = options

  // Helper function to build locale data from cache
  const buildLocaleData = (): LocaleData => {
    const data: LocaleData = {}

    // 1. Global translations -> {locale}.json
    const generalCache = i18n.cache.generalLocaleCache.value || {}
    for (const [locale, content] of Object.entries(generalCache)) {
      if (content && typeof content === 'object' && !Array.isArray(content) && Object.keys(content).length > 0) {
        data[`${locale}.json`] = content as TranslationContent
      }
    }

    // 2. Route-specific translations -> pages/{routeName}/{locale}.json
    // routeLocaleCache has structure: key = "${locale}:${routeName}" -> content
    const routeCache = i18n.cache.routeLocaleCache.value || {}
    for (const [key, content] of Object.entries(routeCache)) {
      if (!content || typeof content !== 'object' || Array.isArray(content) || Object.keys(content).length === 0) {
        continue
      }

      // Parse key "en:home-page" or "fr:about"
      const separatorIndex = key.indexOf(':')
      if (separatorIndex === -1) {
        continue
      }

      const locale = key.substring(0, separatorIndex)
      const routeName = key.substring(separatorIndex + 1)

      // Create virtual file path: pages/{routeName}/{locale}.json
      const path = `pages/${routeName}/${locale}.json`
      data[path] = content as TranslationContent
    }

    return data
  }

  return {
    async getLocalesAndTranslations(): Promise<LocaleData> {
      return buildLocaleData()
    },

    async getConfigs(): Promise<ModuleOptions> {
      return {
        defaultLocale: defaultLocale || i18n.locale.value,
        fallbackLocale: i18n.fallbackLocale.value,
        locales: locales || [],
        translationDir: translationDir || 'locales', // Virtual directory
      } as ModuleOptions
    },

    async saveTranslation(filePath: string, content: TranslationContent): Promise<void> {
      try {
        // Parse virtual file path back to locale and route
        // 1. Check for pages: pages/{routeName}/{locale}.json
        const pageMatch = filePath.match(/^pages\/([^/]+)\/([^/]+)\.json$/)

        if (pageMatch) {
          const [, routeName, locale] = pageMatch
          // Update route cache (overwrite, merge = false)
          if (locale && routeName) {
            i18n.addRouteTranslations(locale, routeName, content as Record<string, unknown>, false)
          }
          console.log(`[vue-bridge] Updated page translation: ${routeName} (${locale})`)
        }
        else {
          // 2. Check for global: {locale}.json
          const globalMatch = filePath.match(/^([^/]+)\.json$/)
          if (globalMatch) {
            const [, locale] = globalMatch
            // Update global cache (overwrite, merge = false)
            if (locale) {
              i18n.addTranslations(locale, content as Record<string, unknown>, false)
            }
            console.log(`[vue-bridge] Updated global translation: ${locale}`)
          }
          else {
            throw new Error(`Unknown file path format: ${filePath}`)
          }
        }

        // Save to localStorage for persistence in Playground
        if (typeof localStorage !== 'undefined') {
          try {
            const storageKey = `i18n_v_save_${filePath}`
            localStorage.setItem(storageKey, JSON.stringify(content, null, 2))
            console.log(`[vue-bridge] Saved to localStorage: ${filePath}`)
          }
          catch (e) {
            console.warn('[vue-bridge] Failed to save to localStorage:', e)
          }
        }
      }
      catch (error) {
        throw new Error(`Failed to save: ${error instanceof Error ? error.message : String(error)}`)
      }
    },

    onLocalesUpdate(callback: (data: LocaleData) => void): () => void {
      // Subscribe to changes in i18n class
      const unsubscribe = i18n.subscribeToChanges(() => {
        callback(buildLocaleData())
      })
      return unsubscribe
    },
  }
}
