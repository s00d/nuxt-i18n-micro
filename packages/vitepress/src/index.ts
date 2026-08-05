export type { VitePressI18nOptions, CreateVitePressI18nResult, VitePressSiteDataLike } from './create'
export { createVitePressI18n } from './create'
export type { DefineI18nThemeOptions } from './define-theme'
export { defineI18nTheme } from './define-theme'
export { messagesFromGlob } from './messages-from-glob'
export type {
  VitePressRouterAdapter,
  VitePressRouterAdapterOptions,
  VitePressRouterLike,
  VitePressGo,
} from './router/adapter'
export {
  createVitePressRouterAdapter,
  getLocaleFromPath,
  routeNameFromPath,
} from './router/adapter'
export type {
  I18nRoutingFromAdapterOptions,
  VitePressI18nRoutingData,
  VitePressI18nRoutingFn,
  VitePressI18nRoutingRoute,
} from './router/i18n-routing'
export { createI18nRoutingFromAdapter } from './router/i18n-routing'

/** Types only — runtime `withI18nMicro` lives in `@i18n-micro/vitepress/config` (Node). */
export type { VirtualI18nConfig, VitePressUserConfigLike, WithI18nMicroOptions } from './with-i18n-micro'

// Re-export Vue surface for a single import path in VitePress themes / MD pages
export {
  createI18n,
  I18nGroup,
  I18nLink,
  I18nSwitcher,
  I18nT,
  useI18n,
} from '@i18n-micro/vue'

export type {
  I18nPlugin,
  I18nRoutingStrategy,
  UseI18nOptions,
  VueI18nOptions,
} from '@i18n-micro/vue'

export { defaultPlural, FormatService, interpolate } from '@i18n-micro/core'
export type {
  CleanTranslation,
  Getter,
  Locale,
  LocaleCode,
  Params,
  PluralFunc,
  Translations,
} from '@i18n-micro/types'

/**
 * Config helper: `@i18n-micro/vitepress/config` (`withI18nMicro`, uses `node:fs`).
 * Theme: `defineI18nTheme` from this entry.
 */
