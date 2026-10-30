import type { Component } from 'vue'

/** A link target: a path with its query and hash, or a location (a named one needs a router that resolves names). */
export type I18nRouteTarget = string | { path?: string; name?: string | symbol; params?: object; query?: object; hash?: string }

/**
 * Routing strategy interface for i18n
 * Implement this interface to integrate with any router library
 */
export interface I18nRoutingStrategy {
  /**
   * Returns current path (without locale prefix if needed, or full path)
   * Used for determining active classes in links
   */
  getCurrentPath: () => string

  /**
   * Component to use for rendering links (e.g., RouterLink)
   */
  linkComponent?: string | Component

  /**
   * Function to navigate to another route/locale
   */
  push: (target: { path: string }) => void

  /**
   * Function to replace current route
   */
  replace: (target: { path: string }) => void

  /**
   * Generate path for specific locale
   */
  resolvePath?: (to: I18nRouteTarget, locale: string) => string | { path?: string }

  /**
   * `href` of a path from `resolvePath`, for a router that navigates by something else
   * (VitePress: paths are relative to the site base, the address bar is not)
   */
  toHref?: (path: string) => string

  /**
   * (Optional) Get current route object for SEO/Meta tags
   */
  getRoute?: () => {
    fullPath: string
    query: Record<string, unknown>
  }
}
