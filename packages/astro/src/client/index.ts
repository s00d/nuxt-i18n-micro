// Core utilities (чистые функции)
export { translate, hasTranslation } from './core'
export type { I18nState } from './core'

// Vue adapter
export { provideI18n, useAstroI18n as useAstroI18nVue } from './vue'

// React adapter
export { I18nProvider, useAstroI18n as useAstroI18nReact } from './react'

// Preact adapter
export { I18nProvider as I18nProviderPreact, useAstroI18n as useAstroI18nPreact } from './preact'

// Svelte adapter
export { createI18nStore, useAstroI18n as useAstroI18nSvelte } from './svelte'
