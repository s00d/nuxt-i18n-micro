// Preact может использовать React Context API, так как Preact совместим с React

import type { ComponentChildren } from 'preact'
import { createContext, createElement } from 'preact'
import { type Dispatch, type StateUpdater, useContext, useMemo, useState } from 'preact/hooks'
import type { I18nClientProps } from '../utils'
import { createIslandApi, type I18nState } from './core'

interface I18nContextValue {
  state: I18nState
  setState: Dispatch<StateUpdater<I18nState>>
}

const I18nContext = createContext<I18nContextValue | null>(null)

/** Провайдер для i18n в Preact островах. Новый `value` (остров с `transition:persist`) заменяет состояние. */
export const I18nProvider = ({ children, value }: { children: ComponentChildren; value: I18nClientProps }) => {
  const [state, setState] = useState<I18nState>(value)
  const [seen, setSeen] = useState(value)
  if (seen !== value) {
    setSeen(value)
    setState(value)
  }
  const context = useMemo(() => ({ state, setState }), [state])
  return createElement(I18nContext.Provider, { value: context }, children)
}

/** Хук для использования i18n в Preact компонентах */
export function useAstroI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useAstroI18n must be used within an I18nProvider')
  }
  const { state, setState } = context
  const api = useMemo(() => createIslandApi(() => state), [state])

  return {
    ...api,

    // Locale state
    locale: state.locale,
    fallbackLocale: state.fallbackLocale,
    currentRoute: state.currentRoute,

    setLocale: (locale: string) => setState((current) => ({ ...current, locale })),
    setRoute: (currentRoute: string) => setState((current) => ({ ...current, currentRoute })),
  }
}
