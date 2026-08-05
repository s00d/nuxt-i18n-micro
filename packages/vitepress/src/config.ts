/**
 * Node / VitePress-config entry — safe to import from `.vitepress/config.*`.
 * Do not import this from the client theme (uses `node:fs`).
 */
export type { VirtualI18nConfig, VitePressUserConfigLike, WithI18nMicroOptions } from './with-i18n-micro'
export { withI18nMicro, warnLocaleMismatch } from './with-i18n-micro'

export type {
  I18nRoutingFromAdapterOptions,
  VitePressI18nRoutingData,
  VitePressI18nRoutingFn,
  VitePressI18nRoutingRoute,
} from './router/i18n-routing'
export { createI18nRoutingFromAdapter } from './router/i18n-routing'

export {
  applyLoadedTranslations,
  listTranslationFiles,
  loadMessages,
  loadTranslationBuckets,
} from './load-messages'
export type { LoadMessagesOptions, LoadedTranslations, TranslationFileRef } from './load-messages'
