import type { Locale } from '@i18n-micro/types'
import { forwardSlashes, trimLeadingSlashes, trimSlashes } from './app-path'
import { deepMergeTranslationsRecursive } from './deep-merge'

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

/**
 * Locales whose files make up `locale`, weakest first: the global fallback, then each
 * `fallbackLocale` link followed to its end (fr → de → en is `[en, de, fr]`), then the locale.
 */
export function buildFallbackLocaleChain(locale: string, locales: SourceLocaleInfo[], globalFallbackLocale?: string): string[] {
  const fallbackOf = new Map(locales.map((entry) => [entry.code, entry.fallbackLocale]))
  const chain: string[] = []
  for (let code: string | undefined = locale; code && fallbackOf.has(code) && !chain.includes(code); code = fallbackOf.get(code)) chain.unshift(code)
  if (globalFallbackLocale && fallbackOf.has(globalFallbackLocale) && !chain.includes(globalFallbackLocale)) chain.unshift(globalFallbackLocale)
  return chain
}

export async function mergeTranslationsFromFallbackChainAsync(
  chain: string[],
  readLocaleFile: (relativePath: string) => Record<string, unknown> | Promise<Record<string, unknown>>,
  relativePathForLocale: (localeCode: string) => string,
): Promise<Record<string, unknown>> {
  const chunks = await Promise.all(chain.map((localeCode) => readLocaleFile(relativePathForLocale(localeCode))))
  return chunks.reduce((result, data) => deepMergeTranslationsRecursive(result, data), {} as Record<string, unknown>)
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

/**
 * Storage key relative to the Nitro unstorage mount (fs-friendly `/` paths).
 */
export function toSourceStorageKey(relativePath: string): string {
  return trimLeadingSlashes(forwardSlashes(relativePath))
}

/**
 * Premerged page/locale payload key — matches the client URL path under `apiBaseUrl`
 * (`{page}/{locale}/data.json`, e.g. `index/en/data.json` → `/_locales/index/en/data.json`).
 */
/**
 * Premerged payload of the root dictionary alone (with fallbacks): what a page without its own
 * `pages/<name>/` folder shows, instead of an empty dictionary.
 */
export const PREMERGED_ROOT_PAGE = '__root'

/**
 * Own key of a premerged file: the root file's content hash, in the root and in every delta made against it.
 * A file without it is a whole chunk (dev, `source`, the server route, a host's older files) and stands alone.
 */
export const PREMERGED_ROOT_MARK = '__i18n_root'

const isTree = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * A page's tree from its root and its delta, as a deep merge makes it: objects merge, anything else replaces. Only the
 * nodes on the delta's paths are new, the rest is the root's, and the delta is taken as it is: a parsed file has no other
 * owner, and copying a large one costs what parsing it did. A stored tree is never written to.
 */
export function mergeOverRoot(root: Record<string, unknown>, delta: Record<string, unknown>): Record<string, unknown> {
  const keys = Object.keys(delta)
  if (!keys.length) return root
  const merged = { ...root }
  for (const key of keys) {
    if (key === '__proto__') continue
    const value = delta[key]
    const base = merged[key]
    merged[key] = isTree(value) && isTree(base) ? mergeOverRoot(base, value) : value
  }
  return merged
}

export function toPremergedStorageKey(pageName: string, locale: string): string {
  const page = trimSlashes(pageName) || 'index'
  return toSourceStorageKey(`${page}/${locale}/data.json`)
}

export async function mergeSourceTranslations(input: MergeSourceTranslationsInput): Promise<Record<string, unknown>> {
  const pageName = resolveSourcePageName(input.pageName, input.disablePageLocales)
  const chain = buildFallbackLocaleChain(input.locale, input.locales, input.globalFallbackLocale)

  // Layer by locale, not by file kind: the active locale's root file beats a fallback's page file.
  // disablePageLocales: root translations only, no `pages/` file at all (not even `pages/index`)
  const files = chain.flatMap((localeCode) =>
    input.disablePageLocales ? [buildSourceRootPath(localeCode)] : [buildSourceRootPath(localeCode), buildSourcePagePath(pageName, localeCode)],
  )
  return mergeTranslationsFromFallbackChainAsync(files, input.readLocaleFile, (file) => file)
}

export function normalizeConfiguredLocales(locales: Array<string | Locale> | undefined): SourceLocaleInfo[] {
  return (locales ?? []).map((locale) =>
    typeof locale === 'string' ? { code: locale } : { code: locale.code, fallbackLocale: locale.fallbackLocale },
  )
}
