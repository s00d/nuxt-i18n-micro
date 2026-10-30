import type { Locale, ModuleOptions } from '@i18n-micro/types'
import { buildSourcePagePath, buildSourceRootPath } from '@i18n-micro/utils/merge-source'
import { parseTranslationRelativePath } from '@i18n-micro/utils/parse-path'
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
  /** The dev server's API base, the plugin's `base` option (default `'/__i18n_api'`). */
  base?: string
}

/** A static host (preview build) answers a POST to a missing endpoint with one of these. */
const NO_ENDPOINT = new Set([404, 405])

/** Keeps the edit in localStorage when there is no dev server to write it; without localStorage the error stands. */
function saveLocally(filePath: string, content: TranslationContent, reason: unknown): void {
  if (typeof localStorage === 'undefined') throw reason
  console.warn('[i18n-bridge] No save endpoint, keeping the edit in localStorage:', reason)
  localStorage.setItem(`i18n_save_${filePath}`, JSON.stringify(content, null, 2))
}

/**
 * POST the file to the dev server's save endpoint. Only an unreachable server or a missing endpoint
 * falls back to localStorage; an error the endpoint reports (rejected path, write failure) is thrown.
 */
async function saveToDisk(base: string, realFilePath: string, content: TranslationContent, filePath: string): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${base}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: realFilePath, content }),
    })
  } catch (networkError) {
    return saveLocally(filePath, content, networkError)
  }
  if (response.ok) {
    console.log(`[i18n-bridge] Saved to disk: ${realFilePath}`)
    return
  }
  const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
  const error = new Error(errorData?.error || `Network response was not ok: ${response.statusText}`)
  if (NO_ENDPOINT.has(response.status)) return saveLocally(filePath, content, error)
  throw error
}

/**
 * Create a universal bridge for DevTools communication
 * This bridge works with any framework by using an adapter pattern
 */
export function createBridge(options: CreateBridgeOptions): I18nDevToolsBridge {
  const { adapter, locales = [], defaultLocale = 'en', translationDir = 'src/locales', base = '/__i18n_api' } = options
  /** The newest save per chunk: an older save that fails must not roll a newer edit back. */
  const latestSaves = new Map<string, number>()

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

      data[routeName === 'index' ? buildSourceRootPath(locale) : buildSourcePagePath(routeName, locale)] = content
    }

    return data
  }

  /** How a translation file maps onto the instance: its `locale:route` cache key and its writer. */
  const hotWriter = (relativePath: string) => {
    const parsed = parseTranslationRelativePath(relativePath)
    if (parsed.type === 'page') {
      return {
        cacheKey: `${parsed.locale}:${parsed.pageName}`,
        apply: (content: TranslationContent) => adapter.addRouteTranslations(parsed.locale, parsed.pageName, content, false),
      }
    }
    if (parsed.type === 'root') {
      return { cacheKey: `${parsed.locale}:index`, apply: (content: TranslationContent) => adapter.addTranslations(parsed.locale, content, false) }
    }
    return null
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
        // Normalize path: remove leading / and extra slashes
        const normalizedPath = filePath.replace(/^\/+/, '').replace(/\/+/g, '/')
        const write = hotWriter(normalizedPath)
        if (!write) throw new Error(`Unknown file path format: ${filePath}`)

        // 1. Hot update in memory, keeping what was there so a failed disk save can put it back
        const previous = adapter.getRouteCache()[write.cacheKey]
        const save = (latestSaves.get(write.cacheKey) ?? 0) + 1
        latestSaves.set(write.cacheKey, save)
        write.apply(content)

        // 2. Save to disk; the app must not keep an edit that is neither on disk nor in localStorage
        const realFilePath = translationDir ? `${translationDir}/${normalizedPath}` : normalizedPath
        try {
          await saveToDisk(base, realFilePath, content, filePath)
        } catch (error) {
          // ponytail: when an older save failed too, the newest rolls back to that edit; a queue per chunk would fix it
          if (latestSaves.get(write.cacheKey) === save) write.apply(previous ?? {})
          throw error
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
