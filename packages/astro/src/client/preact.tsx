// Preact может использовать React Context API, так как Preact совместим с React

import { defaultPlural, FormatService } from '@i18n-micro/core'
import type { CleanTranslation, Params, TranslationKey } from '@i18n-micro/types'
import type { ComponentChildren } from 'preact'
import { createContext, createElement } from 'preact'
import { useContext, useMemo, useState } from 'preact/hooks'
import type { I18nClientProps } from '../utils'
import { hasTranslation, type I18nState, translate } from './core'

const formatter = new FormatService()

const I18nContext = createContext<I18nState | null>(null)

/**
 * Провайдер для i18n в Preact островах
 */
export const I18nProvider = ({ children, value }: { children: ComponentChildren; value: I18nClientProps }) => {
  const [state] = useState<I18nState>(() => ({
    locale: value.locale,
    fallbackLocale: value.fallbackLocale,
    translations: value.translations,
    currentRoute: value.currentRoute,
  }))

  return createElement(I18nContext.Provider, { value: state }, children)
}

/**
 * Хук для использования i18n в Preact компонентах
 */
export function useAstroI18n() {
  const state = useContext(I18nContext)
  if (!state) {
    throw new Error('useAstroI18n must be used within an I18nProvider')
  }

  const t = useMemo(
    () =>
      (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation => {
        return translate(state, key as string, params, defaultValue, routeName)
      },
    [state],
  )

  const ts = useMemo(
    () =>
      (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string => {
        const value = t(key, params, defaultValue, routeName)
        return value?.toString() ?? defaultValue ?? (key as string)
      },
    [t],
  )

  const tc = useMemo(
    () =>
      (key: TranslationKey, count: number | Params, defaultValue?: string): string => {
        const { count: countValue, ...params } = typeof count === 'number' ? { count } : count

        if (countValue === undefined) {
          return defaultValue ?? (key as string)
        }

        const getter = (k: TranslationKey, p?: Params, dv?: string) => {
          return t(k, p, dv)
        }

        const result = defaultPlural(key, Number.parseInt(countValue.toString(), 10), params, state.locale, getter)

        return result ?? defaultValue ?? (key as string)
      },
    [t, state],
  )

  const tn = useMemo(
    () =>
      (value: number, options?: Intl.NumberFormatOptions): string => {
        return formatter.formatNumber(value, state.locale, options)
      },
    [state.locale],
  )

  const td = useMemo(
    () =>
      (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string => {
        return formatter.formatDate(value, state.locale, options)
      },
    [state.locale],
  )

  const tdr = useMemo(
    () =>
      (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string => {
        return formatter.formatRelativeTime(value, state.locale, options)
      },
    [state.locale],
  )

  const has = useMemo(
    () =>
      (key: TranslationKey, routeName?: string): boolean => {
        return hasTranslation(state, key as string, routeName)
      },
    [state],
  )

  return {
    // Translation methods
    t,
    ts,
    tc,
    tn,
    td,
    tdr,
    has,

    // Locale state
    locale: state.locale,
    fallbackLocale: state.fallbackLocale,
    currentRoute: state.currentRoute,

    // Route management (read-only в клиентских островах)
    getRoute: (): string => {
      return state.currentRoute
    },
  }
}
