import React, { createContext, type Dispatch, type SetStateAction, useCallback, useContext, useMemo, useState } from 'react'
import type { I18nClientProps } from '../utils'
import { createIslandApi, type I18nState, withLocale } from './core'

interface I18nContextValue {
  state: I18nState
  setState: Dispatch<SetStateAction<I18nState>>
}

const I18nContext = createContext<I18nContextValue | null>(null)

/** Провайдер для i18n в React островах. Новый `value` (остров с `transition:persist`) заменяет состояние. */
export function I18nProvider({ children, value }: { children: React.ReactNode; value: I18nClientProps }): React.ReactElement {
  const [state, setState] = useState<I18nState>(value)
  const [seen, setSeen] = useState(value)
  if (seen !== value) {
    setSeen(value)
    setState(value)
  }
  const context = useMemo(() => ({ state, setState }), [state])
  return React.createElement(I18nContext.Provider, { value: context }, children)
}

/** Хук для использования i18n в React компонентах */
export function useAstroI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useAstroI18n must be used within an I18nProvider')
  }
  const { state, setState } = context
  const api = useMemo(() => createIslandApi(() => state), [state])
  const setLocale = useCallback((locale: string) => setState((current) => withLocale(current, locale)), [setState])
  const setRoute = useCallback((currentRoute: string) => setState((current) => ({ ...current, currentRoute })), [setState])

  return {
    ...api,

    // Locale state
    locale: state.locale,
    fallbackLocale: state.fallbackLocale,
    currentRoute: state.currentRoute,

    setLocale,
    setRoute,
  }
}
