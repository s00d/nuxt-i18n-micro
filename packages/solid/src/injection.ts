import type { Locale } from '@i18n-micro/types'
import { createContext, useContext } from 'solid-js'
import type { SolidI18n } from './i18n'
import type { I18nRoutingStrategy } from './router/types'
import type { UseI18nReturn } from './use-i18n'

/** Everything a provider hands down: getters over its props, so they stay reactive. */
export interface I18nContextValue {
  readonly i18n: SolidI18n
  readonly locales: Locale[] | undefined
  readonly defaultLocale: string | undefined
  readonly router: I18nRoutingStrategy | undefined
  /** The `useI18n()` object: one per provider, signals do the rest. */
  api?: UseI18nReturn
}

export const I18nContext = createContext<I18nContextValue>()

export const useI18nContextValue = (): I18nContextValue => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('[i18n-micro] I18nContext not found. Make sure I18nProvider is used.')
  }
  return context
}

export const useI18nContext = (): SolidI18n => useI18nContextValue().i18n
export const useI18nLocales = (): Locale[] | undefined => useContext(I18nContext)?.locales
export const useI18nDefaultLocale = (): string | undefined => useContext(I18nContext)?.defaultLocale
export const useI18nRouter = (): I18nRoutingStrategy | undefined => useContext(I18nContext)?.router
