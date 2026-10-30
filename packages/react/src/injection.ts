import type { I18n } from '@i18n-micro/runtime'
import type { Locale } from '@i18n-micro/types'
import { createContext, type HostComponent, type HostNode, type HostStyle, useContext } from '#host'
import type { UseI18nReturn } from './context'

/** Where a link or a switch goes. */
export type RouteTarget = string | { path?: string }

/**
 * Routing strategy interface for i18n
 * Implement this interface to integrate with any router library
 * Matches Vue/Solid package interface for consistency
 */
export interface I18nRoutingStrategy {
  /**
   * Returns the current path with its query and hash, so a locale switch keeps them.
   * Links compare it by page: query and hash do not count.
   */
  getCurrentPath: () => string

  /**
   * Component to use for rendering links (e.g., RouterLink)
   */
  linkComponent?:
    | string
    | HostComponent<{
        href: string
        children?: HostNode
        style?: HostStyle
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
  resolvePath?: (to: RouteTarget, locale: string) => RouteTarget

  /**
   * (Optional) Get current route object for SEO/Meta tags
   */
  getRoute?: () => {
    fullPath: string
    query: Record<string, unknown>
  }
}

/** Everything a provider hands down. One value, so a hook reads one context. */
export interface I18nContextValue {
  i18n: I18n
  locales: Locale[] | null
  defaultLocale: string | null
  router: I18nRoutingStrategy | null
  /** The `useI18n()` object of the current snapshot, shared by every consumer of this provider. */
  api: { snapshot: string; value: UseI18nReturn } | null
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export const useI18nContextValue = (): I18nContextValue => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('[i18n-micro] I18nContext not found. Make sure I18nProvider is used.')
  }
  return context
}

export const useI18nContext = (): I18n => useI18nContextValue().i18n
export const useI18nLocales = (): Locale[] | null => useContext(I18nContext)?.locales ?? null
export const useI18nDefaultLocale = (): string | null => useContext(I18nContext)?.defaultLocale ?? null
export const useI18nRouter = (): I18nRoutingStrategy | null => useContext(I18nContext)?.router ?? null
