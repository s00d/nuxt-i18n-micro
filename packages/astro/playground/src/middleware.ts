// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { createI18nMiddleware, createI18n, createAstroRouterAdapter, loadTranslationsIntoI18n } from '@i18n-micro/astro'
import type { MiddlewareHandler } from 'astro'
// Virtual module created by integration at build time
import { config } from 'virtual:i18n-micro/config'

// Use config from virtual module (created by integration)
// This demonstrates the proper way to use the integration's translationDir option
const globalI18n = createI18n({
  locale: config.defaultLocale,
  fallbackLocale: config.fallbackLocale,
  messages: {}, // Translations will be loaded explicitly below
})

// Load translations from directory using the utility function
// This demonstrates the proper way to use translationDir option
// ⚠️ Note: This only works in Node.js runtime (playground uses Node.js adapter)
if (config.translationDir) {
  loadTranslationsIntoI18n(globalI18n, {
    translationDir: config.translationDir,
    rootDir: process.cwd(), // In playground we're in Node.js runtime
  })
}

// Create router adapter using config from virtual module
const routingStrategy = createAstroRouterAdapter(
  config.locales,
  config.defaultLocale,
)

const i18nMiddleware = createI18nMiddleware({
  i18n: globalI18n,
  defaultLocale: config.defaultLocale,
  locales: config.localeCodes,
  localeObjects: config.locales,
  autoDetect: config.autoDetect,
  routingStrategy,
})

export const onRequest: MiddlewareHandler = i18nMiddleware
