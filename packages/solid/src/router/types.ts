import type { Accessor, Component, JSX } from 'solid-js'

/**
 * Routing strategy interface for i18n
 * Implement this interface to integrate with any router library
 * Matches Vue package interface for consistency
 */
export interface I18nRoutingStrategy {
  /**
   * Returns current path (without locale prefix if needed, or full path)
   * Used for determining active classes in links
   * Note: For SolidJS, this should return the current value synchronously.
   * For reactive updates, use `getCurrentPathAccessor` instead.
   */
  getCurrentPath: () => string

  /**
   * (SolidJS-specific, highly recommended) Returns reactive accessor for current path
   * This is REQUIRED for proper reactivity in SolidJS components.
   * Without this, active link states and path-dependent UI won't update reactively.
   *
   * @example
   * ```tsx
   * const pathnameAccessor = router.getCurrentPathAccessor?.()
   * // Use inside createMemo for reactivity:
   * const currentPath = createMemo(() => pathnameAccessor?.() ?? router.getCurrentPath())
   * ```
   */
  getCurrentPathAccessor?: () => Accessor<string>

  /**
   * Component to use for rendering links (e.g., RouterLink)
   */
  linkComponent?:
    | string
    | Component<{
        href: string
        children?: JSX.Element
        style?: JSX.CSSProperties
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
  resolvePath?: (to: string | { path?: string }, locale: string) => string | { path?: string }

  /**
   * (Optional) Get current route object for SEO/Meta tags
   */
  getRoute?: () => {
    fullPath: string
    query: Record<string, unknown>
  }
}
