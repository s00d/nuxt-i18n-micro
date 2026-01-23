import { writable, get, type Writable } from 'svelte/store'
import type { I18nClientProps } from '../utils'
import { translate, hasTranslation, type I18nState } from './core'
import { defaultPlural, FormatService } from '@i18n-micro/core'
import type { Params, TranslationKey, CleanTranslation } from '@i18n-micro/types'

const formatter = new FormatService()

/**
 * Creates Svelte store for i18n state
 */
export function createI18nStore(props: I18nClientProps): Writable<I18nState> {
  return writable<I18nState>({
    locale: props.locale,
    fallbackLocale: props.fallbackLocale,
    translations: props.translations,
    currentRoute: props.currentRoute,
  })
}

/**
 * Hook for using i18n in Svelte components
 * Use in component <script> block
 */
export function useAstroI18n(store: Writable<I18nState>) {
  const getState = () => get(store)

  const t = (
    key: TranslationKey,
    params?: Params,
    defaultValue?: string | null,
    routeName?: string,
  ): CleanTranslation => {
    return translate(getState(), key as string, params, defaultValue, routeName)
  }

  const ts = (
    key: TranslationKey,
    params?: Params,
    defaultValue?: string,
    routeName?: string,
  ): string => {
    const value = t(key, params, defaultValue, routeName)
    return value?.toString() ?? defaultValue ?? (key as string)
  }

  const tc = (key: TranslationKey, count: number | Params, defaultValue?: string): string => {
    const state = getState()
    const { count: countValue, ...params } = typeof count === 'number' ? { count } : count

    if (countValue === undefined) {
      return defaultValue ?? (key as string)
    }

    const getter = (k: TranslationKey, p?: Params, dv?: string) => {
      return t(k, p, dv)
    }

    const result = defaultPlural(
      key,
      Number.parseInt(countValue.toString(), 10),
      params,
      state.locale,
      getter,
    )

    return result ?? defaultValue ?? (key as string)
  }

  const tn = (value: number, options?: Intl.NumberFormatOptions): string => {
    const state = getState()
    return formatter.formatNumber(value, state.locale, options)
  }

  const td = (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string => {
    const state = getState()
    return formatter.formatDate(value, state.locale, options)
  }

  const tdr = (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string => {
    const state = getState()
    return formatter.formatRelativeTime(value, state.locale, options)
  }

  const has = (key: TranslationKey, routeName?: string): boolean => {
    return hasTranslation(getState(), key as string, routeName)
  }

  return {
    // Store for reactivity in templates (use $i18nStore in templates)
    store,

    // Translation methods
    t,
    ts,
    tc,
    tn,
    td,
    tdr,
    has,

    // Getters for current state (for use in scripts)
    get locale() {
      return getState().locale
    },
    get fallbackLocale() {
      return getState().fallbackLocale
    },
    get currentRoute() {
      return getState().currentRoute
    },

    // Route management
    setLocale: (locale: string) => {
      store.update(state => ({ ...state, locale }))
    },
    setRoute: (routeName: string) => {
      store.update(state => ({ ...state, currentRoute: routeName }))
    },
    getRoute: (): string => {
      return getState().currentRoute
    },
  }
}
