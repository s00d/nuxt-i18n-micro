import type { Locale } from '@i18n-micro/types'
import { deepMergeTranslations } from './deep-merge'

export interface SourceLocaleInfo {
  code: string
  fallbackLocale?: string
}

export interface MergeSourceTranslationsInput {
  locale: string
  pageName: string
  locales: SourceLocaleInfo[]
  globalFallbackLocale?: string
  disablePageLocales?: boolean
  readLocaleFile: (relativePath: string) => Record<string, unknown> | Promise<Record<string, unknown>>
}

export function buildFallbackLocaleChain(locale: string, locales: SourceLocaleInfo[], globalFallbackLocale?: string): string[] {
  const knownCodes = new Set(locales.map((entry) => entry.code))
  const localeConfig = locales.find((entry) => entry.code === locale)

  return [globalFallbackLocale, localeConfig?.fallbackLocale, locale]
    .filter((code): code is string => !!code && knownCodes.has(code))
    .filter((code, index, chain) => chain.indexOf(code) === index)
}

export function mergeTranslationsFromFallbackChain(
  chain: string[],
  readLocaleFile: (relativePath: string) => Record<string, unknown>,
  relativePathForLocale: (localeCode: string) => string,
): Record<string, unknown> {
  let result: Record<string, unknown> = {}

  for (const localeCode of chain) {
    result = deepMergeTranslations(result, readLocaleFile(relativePathForLocale(localeCode)))
  }

  return result
}

export async function mergeTranslationsFromFallbackChainAsync(
  chain: string[],
  readLocaleFile: (relativePath: string) => Record<string, unknown> | Promise<Record<string, unknown>>,
  relativePathForLocale: (localeCode: string) => string,
): Promise<Record<string, unknown>> {
  let result: Record<string, unknown> = {}

  for (const localeCode of chain) {
    const data = await readLocaleFile(relativePathForLocale(localeCode))
    result = deepMergeTranslations(result, data)
  }

  return result
}

export function resolveSourcePageName(pageName: string, disablePageLocales?: boolean): string {
  if (disablePageLocales) return 'index'
  return pageName || 'index'
}

export function buildSourceRootPath(localeCode: string): string {
  return `${localeCode}.json`
}

export function buildSourcePagePath(pageName: string, localeCode: string): string {
  return `pages/${resolveSourcePageName(pageName)}/${localeCode}.json`
}

export function toSourceStorageKey(relativePath: string): string {
  return `assets:i18n:${relativePath.replace(/\//g, ':')}`
}

export async function mergeSourceTranslations(input: MergeSourceTranslationsInput): Promise<Record<string, unknown>> {
  const pageName = resolveSourcePageName(input.pageName, input.disablePageLocales)
  const chain = buildFallbackLocaleChain(input.locale, input.locales, input.globalFallbackLocale)

  const root = await mergeTranslationsFromFallbackChainAsync(chain, input.readLocaleFile, buildSourceRootPath)
  const page = await mergeTranslationsFromFallbackChainAsync(chain, input.readLocaleFile, (localeCode) => buildSourcePagePath(pageName, localeCode))

  return deepMergeTranslations(root, page)
}

export function normalizeConfiguredLocales(locales: Array<string | Locale> | undefined): SourceLocaleInfo[] {
  return (locales ?? []).map((locale) =>
    typeof locale === 'string' ? { code: locale } : { code: locale.code, fallbackLocale: locale.fallbackLocale },
  )
}
