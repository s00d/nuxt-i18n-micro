/**
 * Node helpers (`node:fs`).
 *
 * Prefer `@i18n-micro/vitepress/config` for VitePress `config.mts`
 * (`withI18nMicro` + `createI18nRoutingFromAdapter`).
 * This entry remains for scripts / BC.
 */
export {
  applyLoadedTranslations,
  listTranslationFiles,
  loadMessages,
  loadTranslationBuckets,
} from './load-messages'
export type { LoadMessagesOptions, LoadedTranslations, TranslationFileRef } from './load-messages'

/** @deprecated Prefer `@i18n-micro/vitepress/config`. */
export { withI18nMicro, warnLocaleMismatch } from './with-i18n-micro'
/** @deprecated Prefer `@i18n-micro/vitepress/config`. */
export type { VirtualI18nConfig, VitePressUserConfigLike, WithI18nMicroOptions } from './with-i18n-micro'
