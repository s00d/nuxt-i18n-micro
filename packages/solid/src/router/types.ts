import type { Component, JSX } from 'solid-js'

/** Where a link or a switch goes. */
export type RouteTarget = string | { path?: string }

/**
 * Routing strategy interface for i18n
 * Implement this interface to integrate with any router library
 * Matches Vue package interface for consistency
 */
export interface I18nRoutingStrategy {
  /**
   * Returns the current path with its query and hash, so a locale switch keeps them. Links compare
   * it by page. Read a signal or a reactive location here and links and the switcher follow it.
   */
  getCurrentPath: () => string

  /**
   * Component to use for rendering links (e.g., RouterLink)
   */
  linkComponent?:
    | string
    | Component<{
        href: string
        children?: JSX.Element
        style?: JSX.CSSProperties | string
        class?: string
        [key: string]: unknown
      }>

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
  resolvePath?: (to: RouteTarget, locale: string) => RouteTarget

  /**
   * (Optional) Get current route object for SEO/Meta tags
   */
  getRoute?: () => {
    fullPath: string
    query: Record<string, unknown>
  }
}
