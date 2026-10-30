import type { I18n } from '@i18n-micro/runtime'
import type { Locale } from '@i18n-micro/types'
import { createContext, type HostComponent, type HostNode, type HostStyle, useContext } from '#host'
import type { TranslationMethods, UseI18nReturn } from './context'

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

/** What a provider adds to its instance. It changes with its props, an adapter built in render on every render. */
export interface I18nConfig {
  locales: Locale[] | null
  defaultLocale: string | null
  router: I18nRoutingStrategy | null
  /** The `useI18n()` object of the current snapshot, shared by every consumer of this provider. */
  api: { snapshot: string; value: UseI18nReturn } | null
  /** Translation methods by snapshot: they outlive the config, so `t` does not change with an adapter. */
  methods: { current: TranslationMethods | null }
}

/**
 * The instance alone, stable while the app runs: `useT` and `<I18nT>` read only this, so a new
 * adapter object does not render them.
 */
export const I18nContext = createContext<I18n | null>(null)
export const I18nConfigContext = createContext<I18nConfig | null>(null)

export const useI18nContext = (): I18n => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('[i18n-micro] I18nContext not found. Make sure I18nProvider is used.')
  }
  return context
}

export const useI18nLocales = (): Locale[] | null => useContext(I18nConfigContext)?.locales ?? null
export const useI18nDefaultLocale = (): string | null => useContext(I18nConfigContext)?.defaultLocale ?? null
export const useI18nRouter = (): I18nRoutingStrategy | null => useContext(I18nConfigContext)?.router ?? null
