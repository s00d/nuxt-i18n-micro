import { createContext, useContext } from 'solid-js'
import type { SolidI18n } from './i18n'
import type { Locale } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from './router/types'

// Context keys (analogous to Vue's InjectionKey)
export const I18nContext = createContext<SolidI18n>()
export const I18nLocalesContext = createContext<Locale[]>()
export const I18nDefaultLocaleContext = createContext<string>()
export const I18nRouterContext = createContext<I18nRoutingStrategy | undefined>()

// Helper hooks (analogous to Vue's inject)
export const useI18nContext = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('[i18n-micro] I18nContext not found. Make sure I18nProvider is used.')
  }
  return context
}

export const useI18nLocales = () => {
  const context = useContext(I18nLocalesContext)
  if (!context) {
    throw new Error('[i18n-micro] I18nLocalesContext not found. Make sure I18nLocalesContext is provided.')
  }
  return context
}

export const useI18nDefaultLocale = () => {
  const context = useContext(I18nDefaultLocaleContext)
  if (!context) {
    throw new Error('[i18n-micro] I18nDefaultLocaleContext not found. Make sure I18nDefaultLocaleContext is provided.')
  }
  return context
}

export const useI18nRouter = () => {
  return useContext(I18nRouterContext)
}
