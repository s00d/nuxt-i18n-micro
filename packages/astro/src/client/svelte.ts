import { get, type Writable, writable } from 'svelte/store'
import type { I18nClientProps } from '../utils'
import { createIslandApi, type I18nState } from './core'

/**
 * Creates a Svelte store for i18n state. An island kept by `transition:persist` follows its new
 * props with `$: store.set(i18n)` (`$effect(() => store.set(i18n))` with runes).
 */
export function createI18nStore(props: I18nClientProps): Writable<I18nState> {
  return writable<I18nState>(props)
}

/**
 * Hook for using i18n in Svelte components
 * Use in the component's <script> block
 */
export function useAstroI18n(store: Writable<I18nState>) {
  const getState = () => get(store)

  return {
    // Store for reactivity in templates (use $i18nStore in templates)
    store,

    ...createIslandApi(getState),

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
      store.update((state) => ({ ...state, locale }))
    },
    setRoute: (routeName: string) => {
      store.update((state) => ({ ...state, currentRoute: routeName }))
    },
  }
}
