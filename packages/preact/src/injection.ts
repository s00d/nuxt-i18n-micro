import { createContext } from 'preact'
import { useContext } from 'preact/hooks'
import type { PreactI18n } from './i18n'
import type { Locale } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from './router/types'

// Context keys (analogous to Vue's InjectionKey)
export const I18nContext = createContext<PreactI18n | null>(null)
export const I18nLocalesContext = createContext<Locale[] | null>(null)
export const I18nDefaultLocaleContext = createContext<string | null>(null)
export const I18nRouterContext = createContext<I18nRoutingStrategy | null>(null)

// Helper hooks (analogous to Vue's inject)
export const useI18nContext = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('[i18n-micro] I18nContext not found. Make sure I18nProvider is used.')
  }
  return context
}

export const useI18nLocales = () => {
  return useContext(I18nLocalesContext)
}

export const useI18nDefaultLocale = () => {
  return useContext(I18nDefaultLocaleContext)
}

export const useI18nRouter = () => {
  return useContext(I18nRouterContext)
}
