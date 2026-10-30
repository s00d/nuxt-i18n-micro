import { computed, type InjectionKey, inject, type MaybeRefOrGetter, provide, type Ref, shallowRef, toValue, watch } from 'vue'
import type { I18nClientProps } from '../utils'
import { createIslandApi, type I18nState, withLocale } from './core'

const I18nSymbol = Symbol('i18n-astro') as InjectionKey<Ref<I18nState>>

/**
 * Initializes the i18n provider for a Vue island. Call in the island's root component, with a
 * getter (`() => props.i18n`) so an island kept by `transition:persist` follows its new props.
 * `shallowRef`: translations are never edited in place, and deep tracking costs 11× on every `t`.
 */
export function provideI18n(props: MaybeRefOrGetter<I18nClientProps>): Ref<I18nState> {
  const state = shallowRef<I18nState>(toValue(props))
  watch(
    () => toValue(props),
    (next) => {
      state.value = next
    },
  )
  provide(I18nSymbol, state)
  return state
}

/**
 * Hook for using i18n in Vue components
 */
export function useAstroI18n() {
  const state = inject(I18nSymbol)
  if (!state) {
    throw new Error('useAstroI18n must be used within a component that calls provideI18n')
  }
  const setLocale = (locale: string) => {
    state.value = withLocale(state.value, locale)
  }
  const setRoute = (currentRoute: string) => {
    state.value = { ...state.value, currentRoute }
  }

  return {
    ...createIslandApi(() => state.value),

    // Reactive locale state
    locale: computed({
      get: () => state.value.locale,
      set: setLocale,
    }),
    fallbackLocale: computed(() => state.value.fallbackLocale),
    currentRoute: computed({
      get: () => state.value.currentRoute,
      set: setRoute,
    }),

    // Route management
    setLocale,
    setRoute,
  }
}
