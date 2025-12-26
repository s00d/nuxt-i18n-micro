/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { ParentComponent, JSX } from 'solid-js'
import type { SolidI18n } from './i18n'
import type { Locale } from '@i18n-micro/types'
import { I18nContext, I18nLocalesContext, I18nDefaultLocaleContext, I18nRouterContext } from './injection'
import type { I18nRoutingStrategy } from './router/types'

export interface I18nProviderProps {
  i18n: SolidI18n
  locales?: Locale[]
  defaultLocale?: string
  routingStrategy?: I18nRoutingStrategy
}

export const I18nProvider: ParentComponent<I18nProviderProps> = (props): JSX.Element => {
  const children = props.children as JSX.Element
  return (
    // @ts-expect-error - Provider components type conflict with Vue JSX
    <I18nContext.Provider value={props.i18n}>
      {props.locales && (
        // @ts-expect-error - Provider components type conflict with Vue JSX
        <I18nLocalesContext.Provider value={props.locales}>
          {props.defaultLocale && (
            // @ts-expect-error - Provider components type conflict with Vue JSX
            <I18nDefaultLocaleContext.Provider value={props.defaultLocale}>
              {props.routingStrategy && (
                // @ts-expect-error - Provider components type conflict with Vue JSX
                <I18nRouterContext.Provider value={props.routingStrategy}>
                  {children}
                </I18nRouterContext.Provider>
              )}
              {!props.routingStrategy && children}
            </I18nDefaultLocaleContext.Provider>
          )}
          {!props.defaultLocale && children}
        </I18nLocalesContext.Provider>
      )}
      {!props.locales && children}
    </I18nContext.Provider>
  ) as unknown as JSX.Element
}

// Keep useI18nContext for backward compatibility
export { useI18nContext } from './injection'
