import type { Getter, Params, PluralFunc, Strategies, TranslationKey } from '@i18n-micro/types'

const RE_TOKEN = /\{(\w+)\}/g
const DEFAULT_ROUTE_NAME = 'index'

export function translationCacheKey(locale: string, routeName?: string): string {
  return `${locale}:${routeName || DEFAULT_ROUTE_NAME}`
}

export function resolveTranslation(obj: Record<string, unknown> | null | undefined, key: string): unknown | null {
  if (obj === null || obj === undefined) return null
  const value = getByPath(obj, key)
  return value === undefined ? null : value
}

export function hasTranslationValue(obj: Record<string, unknown> | null | undefined, key: string): boolean {
  return resolveTranslation(obj, key) !== null
}

export interface MergeTranslationChunkOptions {
  /** When true, existing keys win over incoming. Default: incoming wins. */
  preserveExisting?: boolean
}

/**
 * Merge two translation chunks, descending into nested objects.
 *
 * `Object.assign` is wrong here, and quietly so: chunks are trees, so a shallow merge of
 * `{ nav: { about, home } }` with `{ nav: { extra } }` replaces the whole `nav` subtree
 * and loses `about` and `home`. Nothing throws — the keys simply resolve to themselves
 * later, which is the raw-key render the loader exists to prevent.
 *
 * Written here rather than reusing `@i18n-micro/utils/deep-merge`: that package carries
 * build-time dependencies, and `core` is installed by every consumer at runtime.
 */
export function mergeTranslationChunk(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  options?: MergeTranslationChunkOptions,
): Record<string, unknown> {
  if (Object.keys(existing).length === 0) return incoming
  return options?.preserveExisting ? mergeTranslationTrees(incoming, existing) : mergeTranslationTrees(existing, incoming)
}

const isPlainTranslationObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/** `source` wins, at every depth. Arrays and primitives replace rather than merge. */
function mergeTranslationTrees(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target }

  for (const key in source) {
    // Assigning either would walk up the prototype chain of the merged object.
    if (key === '__proto__' || key === 'constructor') continue

    const incoming = source[key]
    const existing = result[key]
    result[key] = isPlainTranslationObject(incoming) && isPlainTranslationObject(existing) ? mergeTranslationTrees(existing, incoming) : incoming
  }

  return result
}

export function interpolate(template: string, params: Params): string {
  if (!params) return template
  if (template.indexOf('{') === -1) return template

  return template.replace(RE_TOKEN, (_, key) => {
    const value = params[key]
    return value !== undefined ? String(value) : `{${key}}`
  })
}

export function getByPath(obj: Record<string, unknown> | null | undefined, path: string): unknown {
  if (obj === null || obj === undefined || typeof path !== 'string' || path.length === 0) return undefined

  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path]
  }

  if (!path.includes('.')) return undefined

  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    const record = current as Record<string, unknown>
    if (!Object.prototype.hasOwnProperty.call(record, part)) return undefined
    current = record[part]
  }
  return current
}

export function withPrefixStrategy(strategy: Strategies) {
  return strategy === 'prefix' || strategy === 'prefix_and_default'
}

export function isNoPrefixStrategy(strategy: Strategies) {
  return strategy === 'no_prefix'
}

export function isPrefixStrategy(strategy: Strategies) {
  return strategy === 'prefix'
}

export function isPrefixExceptDefaultStrategy(strategy: Strategies) {
  return strategy === 'prefix_except_default'
}

export function isPrefixAndDefaultStrategy(strategy: Strategies) {
  return strategy === 'prefix_and_default'
}

/**
 * Default pluralization function
 * Splits translation by '|' and selects form based on count
 * @param key - Translation key
 * @param count - Count for pluralization
 * @param params - Parameters for translation
 * @param _locale - Current locale (unused in default implementation)
 * @param getTranslation - Function to get translation value
 * @returns Selected plural form or null if not found
 */
export const defaultPlural: PluralFunc = (key: TranslationKey, count: number, params: Params, _locale: string, getTranslation: Getter) => {
  const translation = getTranslation(key, params)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  if (forms.length === 0) return null
  const selectedForm = count < forms.length ? forms[count] : forms[forms.length - 1]
  if (!selectedForm) return null
  return selectedForm.trim().replace('{count}', count.toString())
}
