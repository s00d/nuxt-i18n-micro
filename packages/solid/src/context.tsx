import { localeIsoMap } from '@i18n-micro/core'
import type { Locale } from '@i18n-micro/types'
import { createComputed, type JSX, type ParentComponent, useContext } from 'solid-js'
import type { SolidI18n } from './i18n'
import { I18nContext } from './injection'
import type { I18nRoutingStrategy } from './router/types'

export interface I18nProviderProps {
  i18n: SolidI18n
  locales?: Locale[]
  defaultLocale?: string
  routingStrategy?: I18nRoutingStrategy
}

// An omitted prop keeps the value of an outer provider.
export const I18nProvider: ParentComponent<I18nProviderProps> = (props): JSX.Element => {
  const outer = useContext(I18nContext)
  const value = {
    get i18n() {
      return props.i18n
    },
    get locales() {
      return props.locales ?? outer?.locales
    },
    get defaultLocale() {
      return props.defaultLocale ?? outer?.defaultLocale
    },
    get router() {
      return props.routingStrategy ?? outer?.router
    },
  }
  createComputed(() => {
    if (props.locales) props.i18n.setLocaleIso(localeIsoMap(props.locales))
  })
  return <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>
}

export { useI18nContext } from './injection'
