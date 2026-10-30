/** `@i18n-micro/astro/middleware`: what `i18nIntegration` installs. Nothing here reads the disk, so it runs on the edge too. */
import { config } from 'virtual:i18n-micro/config'
import { messages } from 'virtual:i18n-micro/messages'
import { localeIsoMap } from '@i18n-micro/core'
import { AstroI18n } from './composer'
import { createI18nMiddleware } from './middleware'

const i18n = new AstroI18n({
  locale: config.defaultLocale,
  fallbackLocale: config.fallbackLocale,
  missingWarn: config.missingWarn,
  localeIso: localeIsoMap(config.locales),
})
i18n.loadMessages(messages.root, messages.routes)

export const onRequest = createI18nMiddleware({
  i18n,
  defaultLocale: config.defaultLocale,
  locales: config.localeCodes,
  localeObjects: config.locales,
  autoDetect: config.autoDetect,
  redirectToDefault: config.redirectToDefault,
  localeCookie: config.localeCookie,
  base: config.base,
})
