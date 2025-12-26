/**
 * Routing strategy interface for i18n in Astro
 * Implement this interface to integrate with any routing logic
 * Matches Vue/Solid/React package interface for consistency
 * Adapted for Astro SSR context (push/replace are optional)
 */
export interface I18nRoutingStrategy {
  /**
   * Returns current path (without locale prefix if needed, or full path)
   * Used for determining active classes in links
   */
  getCurrentPath: () => string

  /**
   * Generate path for specific locale
   */
  resolvePath?: (to: string | { path?: string }, locale: string) => string | { path?: string }

  /**
   * Get route name from path (e.g., /en/about -> about)
   * Used in middleware to set route name
   */
  getRouteName?: (path: string, locales: string[]) => string

  /**
   * Get locale from path
   * Checks if first segment is a locale code
   */
  getLocaleFromPath?: (path: string, defaultLocale: string, locales: string[]) => string

  /**
   * Switch locale in path
   * Replaces or adds locale prefix to path
   */
  switchLocalePath?: (path: string, newLocale: string, locales: string[], defaultLocale?: string) => string

  /**
   * Localize path with locale prefix
   */
  localizePath?: (path: string, locale: string, locales: string[], defaultLocale?: string) => string

  /**
   * Remove locale from path
   */
  removeLocaleFromPath?: (path: string, locales: string[]) => string

  /**
   * (Optional) Function to navigate to another route/locale
   * Not used in SSR, but can be used in client-side islands
   */
  push?: (target: { path: string }) => void

  /**
   * (Optional) Function to replace current route
   * Not used in SSR, but can be used in client-side islands
   */
  replace?: (target: { path: string }) => void

  /**
   * (Optional) Get current route object for SEO/Meta tags
   */
  getRoute?: () => {
    fullPath: string
    query: Record<string, unknown>
  }
}
