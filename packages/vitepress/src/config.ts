/**
 * VitePress config entry (`node:fs`). Theme/runtime: `/theme` or `.`.
 */
export type { VirtualI18nConfig, VitePressUserConfigLike, WithI18nOptions } from './plugin/with-i18n'
export { withI18n, warnLocaleMismatch } from './plugin/with-i18n'

export { buildVitePressLocales } from './plugin/vitepress-locales'
export type { BuildVitePressLocalesOptions, VitePressLocaleEntry } from './plugin/vitepress-locales'

export { buildVitePressLocaleHead, relativePathToRoutePath } from './seo/locale-head'
export type { BuildVitePressLocaleHeadOptions, VitePressHeadTuple, VitePressLocaleHeadObject } from './seo/locale-head'
