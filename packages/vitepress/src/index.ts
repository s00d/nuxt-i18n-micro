/**
 * Client / theme runtime.
 * Config: `@i18n-micro/vitepress/config`. Node scripts: `@i18n-micro/vitepress/node`.
 */
export type { CreateI18nOptions, CreateI18nResult, PathMethods, VitePressSiteDataLike } from './runtime/create'
export { createI18n } from './runtime/create'
export { messagesFromGlob } from './runtime/messages-from-glob'

/** Path helpers for themes that sync locale manually (`syncWithVitePress: false`). */
export { getLocaleFromPath, stripSiteBase, routeNameFromPath } from './router/adapter'

export type { VirtualI18nConfig, VitePressUserConfigLike, WithI18nOptions } from './plugin/with-i18n'

export { I18nGroup, I18nLink, I18nSwitcher, I18nT, useI18n } from '@i18n-micro/vue'
export type { I18nPlugin, I18nRoutingStrategy, UseI18nOptions, VueI18nOptions } from '@i18n-micro/vue'
export { defaultPlural, FormatService, interpolate } from '@i18n-micro/core'
export type { CleanTranslation, Getter, Locale, LocaleCode, Params, PluralFunc, Translations } from '@i18n-micro/types'
