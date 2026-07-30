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

  // Own keys only: `for…in` also walks the prototype chain, so a chunk deserialised into a
  // non-plain object would contribute inherited members as if they were translations.
  for (const key of Object.keys(source)) {
    // The only key that must be skipped: assigning it invokes the prototype setter. A
    // `constructor` key is an ordinary own property here, and a locale file may well have one.
    if (key === '__proto__') continue

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

/**
 * A translation tree with `key` set to `value`, whatever either of them is.
 *
 * Replaces rather than merges: `set('aaa', { x: 1 })` on `{ aaa: { bbb: 'ccc' } }` leaves
 * `aaa` holding only `x`, and `set('aaa', 'text')` leaves a string where a subtree was.
 * Merging is what `mergeTranslationChunk` is for.
 *
 * The tree is not mutated — only the nodes along the path are copied, so the call costs the
 * depth of the key and not the size of the dictionary, and callers holding the old tree
 * (a frozen SSR chunk, a rendered snapshot) keep seeing what they had.
 *
 * Key resolution mirrors {@link getByPath}: an existing flat key wins over the dotted path,
 * so a dictionary written as `{ 'a.b': 'x' }` is updated in place rather than gaining a
 * nested `a.b` that `t('a.b')` would never read.
 */
export function setTranslationAtKey(tree: Record<string, unknown>, key: string, value: unknown): Record<string, unknown> {
  if (typeof key !== 'string' || key.length === 0) return tree

  if (Object.prototype.hasOwnProperty.call(tree, key) || !key.includes('.')) {
    if (key === '__proto__') return tree
    return { ...tree, [key]: value }
  }

  const path = key.split('.')
  if (path.some((segment) => segment === '__proto__')) return tree

  const root: Record<string, unknown> = { ...tree }
  let node = root
  for (const segment of path.slice(0, -1)) {
    const existing = node[segment]
    // Anything that is not a plain object has nowhere to put the rest of the path, so it is
    // replaced: `set('a.b', 1)` where `a` is a string means `a` becomes `{ b: 1 }`.
    const next = isPlainTranslationObject(existing) ? { ...existing } : {}
    node[segment] = next
    node = next
  }
  node[path[path.length - 1]!] = value
  return root
}

export function collectTranslationPaths(obj: Record<string, unknown>, paths: Set<string>, prefix = ''): void {
  for (const key of Object.keys(obj)) {
    if (key === '__proto__') continue
    const path = prefix ? `${prefix}.${key}` : key
    paths.add(path)
    const value = obj[key]
    if (isPlainTranslationObject(value)) collectTranslationPaths(value, paths, path)
  }
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
