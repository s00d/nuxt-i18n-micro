import type React from 'react'

/**
 * Routing strategy interface for i18n
 * Implement this interface to integrate with any router library
 * Matches Vue/Solid package interface for consistency
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
  linkComponent?:
    | string
    | React.ComponentType<{
        href: string
        children?: React.ReactNode
        style?: React.CSSProperties
        className?: string
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
  resolvePath?: (to: string | { path?: string }, locale: string) => string | { path?: string }

  /**
   * (Optional) Get current route object for SEO/Meta tags
   */
  getRoute?: () => {
    fullPath: string
    query: Record<string, unknown>
  }
}
