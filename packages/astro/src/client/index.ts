// Core utilities (pure functions)

export type { I18nState } from './core'
export { hasTranslation, translate } from './core'
// Preact adapter
export { I18nProvider as I18nProviderPreact, useAstroI18n as useAstroI18nPreact } from './preact'

// React adapter
export { I18nProvider, useAstroI18n as useAstroI18nReact } from './react'
// Svelte adapter
export { createI18nStore, useAstroI18n as useAstroI18nSvelte } from './svelte'
// Vue adapter
export { provideI18n, useAstroI18n as useAstroI18nVue } from './vue'
