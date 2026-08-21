import type { Locale } from '@i18n-micro/types'
import { createI18n as createNodeI18n, type I18n, type I18nOptions } from '@i18n-micro/node'
import { createVitePressRouterAdapter, type PathMethods } from '../router/adapter'

export type { I18nOptions, LoadedTranslations } from '@i18n-micro/node'
export { loadTranslations, loadRootTranslations } from '@i18n-micro/node'
export type { PathMethods }

export interface CreateI18nOptions extends I18nOptions {
  /** Locales for path helpers (`localizePath`, …). Defaults to `[{ code: locale }]`. */
  locales?: Locale[] | string[]
  defaultLocale?: string
  localeKeyToCode?: Record<string, string>
  base?: string
}

export type NodeI18n = I18n & PathMethods

/**
 * Node `createI18n` (`@i18n-micro/node`) + VitePress path methods from the router adapter.
 */
export function createI18n(options: CreateI18nOptions): NodeI18n {
  const defaultLocale = options.defaultLocale || options.locale
  const locales = (options.locales?.length ? options.locales : [options.locale]).map((item) => (typeof item === 'string' ? { code: item } : item))
  const adapter = createVitePressRouterAdapter({
    locales,
    defaultLocale,
    localeKeyToCode: options.localeKeyToCode,
    base: options.base,
  })

  return createNodeI18n(options).extend({
    localizePath: adapter.localizePath,
    switchLocalePath: adapter.switchLocalePath,
    getLocaleFromPath: adapter.getLocaleFromPath,
    removeLocaleFromPath: adapter.removeLocaleFromPath,
    routeNameFromPath: adapter.routeNameFromPath,
  })
}
