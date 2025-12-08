import type { ModuleOptions } from '@i18n-micro/types'

export type JSONValue = string | null | number | boolean | { [key: string]: JSONValue }

export interface TranslationContent {
  [key: string]: JSONValue
}

export type LocaleData = Record<string, TranslationContent>

/**
 * Bridge interface for communication between DevTools UI and framework-specific RPC
 * This abstraction allows the UI to work with both Nuxt and Astro DevTools
 */
export interface I18nDevToolsBridge {
  /**
   * Get all locales and their translation files
   * @returns Promise resolving to a record of file paths to translation content
   */
  getLocalesAndTranslations(): Promise<LocaleData>

  /**
   * Get i18n module configuration
   * @returns Promise resolving to module options
   */
  getConfigs(): Promise<ModuleOptions>

  /**
   * Save translation content to a file
   * @param filePath - Path to the translation file
   * @param content - Translation content to save
   */
  saveTranslation(filePath: string, content: TranslationContent): Promise<void>

  /**
   * Subscribe to locale updates from the server
   * @param callback - Function to call when locales are updated
   * @returns Unsubscribe function
   */
  onLocalesUpdate(callback: (data: LocaleData) => void): () => void
}
