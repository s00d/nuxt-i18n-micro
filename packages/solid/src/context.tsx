// @ts-nocheck

import type { Locale } from '@i18n-micro/types'
import { type JSX, type ParentComponent, useContext } from 'solid-js'
import type { SolidI18n } from './i18n'
import { I18nContext, I18nDefaultLocaleContext, I18nLocalesContext, I18nRouterContext } from './injection'
import type { I18nRoutingStrategy } from './router/types'

export interface I18nProviderProps {
  i18n: SolidI18n
  locales?: Locale[]
  defaultLocale?: string
  routingStrategy?: I18nRoutingStrategy
}

// Every provider always renders, so `props.children` is read lazily inside the innermost one
// (reading it in the body would create the children before any context exists). An omitted
// prop keeps the value of an outer provider instead of shadowing it with undefined.
export const I18nProvider: ParentComponent<I18nProviderProps> = (props): JSX.Element => {
  const outerLocales = useContext(I18nLocalesContext)
  const outerDefaultLocale = useContext(I18nDefaultLocaleContext)
  const outerRouter = useContext(I18nRouterContext)
  return (
    // @ts-expect-error - Provider components type conflict with Vue JSX
    (
      <I18nContext.Provider value={props.i18n}>
        <I18nLocalesContext.Provider value={props.locales ?? outerLocales}>
          <I18nDefaultLocaleContext.Provider value={props.defaultLocale ?? outerDefaultLocale}>
            <I18nRouterContext.Provider value={props.routingStrategy ?? outerRouter}>{props.children}</I18nRouterContext.Provider>
          </I18nDefaultLocaleContext.Provider>
        </I18nLocalesContext.Provider>
      </I18nContext.Provider>
    ) as unknown as JSX.Element
  )
}

// Keep useI18nContext for backward compatibility
export { useI18nContext } from './injection'
