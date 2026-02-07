import { defaultPlural, FormatService } from '@i18n-micro/core'
import type { CleanTranslation, Params, TranslationKey } from '@i18n-micro/types'
import { computed, type InjectionKey, inject, provide, type Ref, ref } from 'vue'
import type { I18nClientProps } from '../utils'
import { hasTranslation, type I18nState, translate } from './core'

const formatter = new FormatService()

const I18nSymbol = Symbol('i18n-astro') as InjectionKey<Ref<I18nState>>

/**
 * Инициализирует i18n провайдер для Vue острова
 * Вызывайте в корневом компоненте острова
 */
export function provideI18n(props: I18nClientProps): Ref<I18nState> {
  const state = ref<I18nState>({
    locale: props.locale,
    fallbackLocale: props.fallbackLocale,
    translations: props.translations,
    currentRoute: props.currentRoute,
  })
  provide(I18nSymbol, state)
  return state
}

/**
 * Хук для использования i18n в Vue компонентах
 */
export function useAstroI18n() {
  const state = inject(I18nSymbol)
  if (!state) {
    throw new Error('useAstroI18n must be used within a component that calls provideI18n')
  }

  const t = (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation => {
    return translate(state.value, key as string, params, defaultValue, routeName)
  }

  const ts = (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string => {
    const value = t(key, params, defaultValue, routeName)
    return value?.toString() ?? defaultValue ?? (key as string)
  }

  const tc = (key: TranslationKey, count: number | Params, defaultValue?: string): string => {
    const { count: countValue, ...params } = typeof count === 'number' ? { count } : count

    if (countValue === undefined) {
      return defaultValue ?? (key as string)
    }

    const getter = (k: TranslationKey, p?: Params, dv?: string) => {
      return t(k, p, dv)
    }

    const result = defaultPlural(key, Number.parseInt(countValue.toString(), 10), params, state.value.locale, getter)

    return result ?? defaultValue ?? (key as string)
  }

  const tn = (value: number, options?: Intl.NumberFormatOptions): string => {
    return formatter.formatNumber(value, state.value.locale, options)
  }

  const td = (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string => {
    return formatter.formatDate(value, state.value.locale, options)
  }

  const tdr = (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string => {
    return formatter.formatRelativeTime(value, state.value.locale, options)
  }

  const has = (key: TranslationKey, routeName?: string): boolean => {
    return hasTranslation(state.value, key as string, routeName)
  }

  return {
    // Translation methods
    t,
    ts,
    tc,
    tn,
    td,
    tdr,
    has,

    // Reactive locale state
    locale: computed({
      get: () => state.value.locale,
      set: (val: string) => {
        state.value = { ...state.value, locale: val }
      },
    }),
    fallbackLocale: computed(() => state.value.fallbackLocale),
    currentRoute: computed({
      get: () => state.value.currentRoute,
      set: (val: string) => {
        state.value = { ...state.value, currentRoute: val }
      },
    }),

    // Route management
    setLocale: (locale: string) => {
      state.value = { ...state.value, locale }
    },
    setRoute: (routeName: string) => {
      state.value = { ...state.value, currentRoute: routeName }
    },
    getRoute: (): string => {
      return state.value.currentRoute
    },
  }
}
