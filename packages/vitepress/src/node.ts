/**
 * Node scripts / generators — one `createI18n` (load + `t` + path methods).
 * Built on `@i18n-micro/node` + `BaseI18n.extend`.
 */
export type { CreateI18nOptions, NodeI18n, I18nOptions, LoadedTranslations } from './runtime/node-create'
export { createI18n, loadTranslations, loadRootTranslations } from './runtime/node-create'

export { buildVitePressLocales } from './plugin/vitepress-locales'
export type { BuildVitePressLocalesOptions, VitePressLocaleEntry } from './plugin/vitepress-locales'
