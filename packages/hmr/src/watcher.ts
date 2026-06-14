import type { Locale } from '@i18n-micro/types'
import { deepMergeTranslations } from '@i18n-micro/utils/deep-merge'
import { mergeSourceTranslations, normalizeConfiguredLocales } from '@i18n-micro/utils/merge-source'
import { parseTranslationRelativePath } from '@i18n-micro/utils/parse-path'
import type { TranslationPayloadMode } from '@i18n-micro/utils/payload-config'

interface TranslationWatchCache {
  set(key: string, value: TranslationWatchCacheEntry): void
  delete(key: string): boolean
}

interface TranslationWatchCacheEntry {
  data: Record<string, unknown>
  json: string
}

type ParsedTranslationWatchPath = { type: 'page'; pageName: string; locale: string } | { type: 'root'; locale: string } | { type: 'ignore' }

interface DevTranslationMergeInput {
  translationPayloadMode?: TranslationPayloadMode
  locale: string
  pageName: string
  locales?: Array<string | Locale>
  fallbackLocale?: string
  disablePageLocales?: boolean
  readLocaleFile: (relativePath: string) => Record<string, unknown> | Promise<Record<string, unknown>>
}

interface ApplyTranslationWatchCacheUpdateInput {
  serverCache: TranslationWatchCache
  storageCache?: TranslationWatchCache | null
  routesLocaleLinks?: Record<string, string>
  locale: string
  pageName: string
  merged: Record<string, unknown>
}

export interface HandleTranslationWatchChangeInput {
  relativePath: string
  configuredLocales: Set<string>
  listPageNames: () => string[]
  serverCache: TranslationWatchCache
  storageCache?: TranslationWatchCache | null
  routesLocaleLinks?: Record<string, string>
  mergeInput: Omit<DevTranslationMergeInput, 'locale' | 'pageName'>
}

function buildTranslationWatchCacheEntry(data: Record<string, unknown>): TranslationWatchCacheEntry {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return { data, json }
}

export function parseTranslationWatchRelativePath(relativePath: string): ParsedTranslationWatchPath {
  return parseTranslationRelativePath(relativePath)
}

async function mergeDevTranslations(input: DevTranslationMergeInput): Promise<Record<string, unknown>> {
  if (input.translationPayloadMode === 'source') {
    return mergeSourceTranslations({
      locale: input.locale,
      pageName: input.pageName,
      locales: normalizeConfiguredLocales(input.locales),
      globalFallbackLocale: input.fallbackLocale,
      disablePageLocales: input.disablePageLocales,
      readLocaleFile: input.readLocaleFile,
    })
  }

  const root = await input.readLocaleFile(`${input.locale}.json`)
  const page = await input.readLocaleFile(`pages/${input.pageName}/${input.locale}.json`)
  return deepMergeTranslations(root, page)
}

function applyTranslationWatchCacheUpdate(input: ApplyTranslationWatchCacheUpdateInput): void {
  const entry = buildTranslationWatchCacheEntry(input.merged)
  const cacheKey = `${input.locale}:${input.pageName}`

  input.serverCache.set(cacheKey, entry)
  input.storageCache?.delete(cacheKey)

  const aliases = Object.keys(input.routesLocaleLinks ?? {}).filter((alias) => input.routesLocaleLinks?.[alias] === input.pageName)
  for (const alias of aliases) {
    const aliasKey = `${input.locale}:${alias}`
    input.serverCache.set(aliasKey, entry)
    input.storageCache?.delete(aliasKey)
  }
}

export async function handleTranslationWatchChange(input: HandleTranslationWatchChangeInput): Promise<'page' | 'root' | 'ignored'> {
  const parsed = parseTranslationWatchRelativePath(input.relativePath)
  if (parsed.type === 'ignore') {
    return 'ignored'
  }

  const mergePage = async (locale: string, pageName: string) => {
    const merged = await mergeDevTranslations({
      ...input.mergeInput,
      locale,
      pageName,
    })
    applyTranslationWatchCacheUpdate({
      serverCache: input.serverCache,
      storageCache: input.storageCache,
      routesLocaleLinks: input.routesLocaleLinks,
      locale,
      pageName,
      merged,
    })
  }

  if (parsed.type === 'page') {
    await mergePage(parsed.locale, parsed.pageName)
    return 'page'
  }

  if (!input.configuredLocales.has(parsed.locale)) {
    return 'ignored'
  }

  for (const pageName of input.listPageNames()) {
    await mergePage(parsed.locale, pageName)
  }

  await mergePage(parsed.locale, 'index')
  return 'root'
}
