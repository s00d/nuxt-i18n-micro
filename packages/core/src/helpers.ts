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
 * Algorithm notes (inspired by `@fastify/deepmerge` / TehShrike `deepmerge`, no dependency):
 * - iterate only `Object.keys(source)` (patch side), indexed `for` — not `for…in`
 * - plain JSON objects merge recursively; arrays / primitives / null replace (i18n leaves)
 * - skip `__proto__` only — `constructor` is a valid translation key
 * - immutable path copies the target once, then overlays source keys
 * - in-place path mutates target (live storage / HMR) — no full-chunk clone
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

/**
 * Deep-merge `incoming` into `target` in place (same nested-object rules as {@link mergeTranslationChunk}).
 * Single pass over patch keys: leaf assigns are O(patch), nested only where both sides are objects.
 */
export function mergeTranslationChunkInPlace(
  target: Record<string, unknown>,
  incoming: Record<string, unknown>,
  options?: MergeTranslationChunkOptions,
): void {
  if (options?.preserveExisting) {
    mergeTranslationTreesInPlacePreserve(target, incoming)
    return
  }
  mergeTranslationTreesInPlace(target, incoming)
}

/** Plain JSON object (not array / null). Dates/RegExp never appear in locale JSON. */
function isPlainTranslationObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Immutable merge: `source` wins. One shallow copy of `target`, then overlay `source` keys
 * (same shape as fastify's mergeObject, without cloning every untouched nested tree).
 */
function mergeTranslationTrees(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target }
  const keys = Object.keys(source)
  for (let i = 0, il = keys.length; i < il; i++) {
    const key = keys[i]!
    // `__proto__` only — assigning it invokes the prototype setter. `constructor` is a normal key.
    if (key === '__proto__') continue

    const incoming = source[key]
    const existing = result[key]
    if (isPlainTranslationObject(incoming) && isPlainTranslationObject(existing)) {
      result[key] = mergeTranslationTrees(existing, incoming)
    } else {
      result[key] = incoming
    }
  }
  return result
}

/**
 * In-place merge: `source` wins. Only walks patch keys (fastify-style).
 * Leaf patches ≈ `Object.assign`; nested object keys recurse without cloning siblings.
 */
function mergeTranslationTreesInPlace(target: Record<string, unknown>, source: Record<string, unknown>): void {
  const keys = Object.keys(source)
  for (let i = 0, il = keys.length; i < il; i++) {
    const key = keys[i]!
    if (key === '__proto__') continue

    const incoming = source[key]
    // Hot leaf path: primitives / arrays / null — assign, no recursion.
    if (incoming === null || typeof incoming !== 'object' || Array.isArray(incoming)) {
      target[key] = incoming
      continue
    }

    const existing = target[key]
    if (existing !== null && typeof existing === 'object' && !Array.isArray(existing)) {
      mergeTranslationTreesInPlace(existing as Record<string, unknown>, incoming as Record<string, unknown>)
    } else {
      target[key] = incoming
    }
  }
}

/** In-place merge where `target` (existing) wins on conflict. */
function mergeTranslationTreesInPlacePreserve(target: Record<string, unknown>, source: Record<string, unknown>): void {
  const keys = Object.keys(source)
  for (let i = 0, il = keys.length; i < il; i++) {
    const key = keys[i]!
    if (key === '__proto__') continue

    const incoming = source[key]
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
      target[key] = incoming
      continue
    }
    const existing = target[key]
    if (isPlainTranslationObject(incoming) && isPlainTranslationObject(existing)) {
      mergeTranslationTreesInPlacePreserve(existing, incoming)
    }
  }
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

  // Flat key wins over nested walk (dictionaries may store `'a.b': 'literal'`).
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path]
  }

  if (!path.includes('.')) return undefined

  // `split` beats manual indexOf/slice on V8 for short dotted paths (measured ~2×).
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

/**
 * Two live lookup layers as one tree, shaped the way a single layer already is.
 *
 * `upper` wins, exactly as a per-key fallthrough does, so the result answers every key the
 * two layers together can answer — with one exception that a tree cannot express: where
 * `upper` holds a scalar and `lower` holds an object at the same path, `t('a')` reads the
 * scalar while `t('a.b')` still reaches into `lower`. Those descendants come back as flat
 * dotted keys, which is what `getByPath` looks at first anyway.
 *
 * The alternative — resolving every collected path one at a time — returned a different
 * shape depending on whether a second layer happened to be live, and repeated each nested
 * leaf as a flat key beside the object holding it.
 */
export function mergeTranslationLayers(lower: Record<string, unknown>, upper: Record<string, unknown>): Record<string, unknown> {
  const merged = mergeLayerTrees(lower, upper)
  const shadowed: Record<string, unknown> = {}
  collectShadowedLeaves(lower, upper, '', shadowed)
  return Object.keys(shadowed).length === 0 ? merged : { ...merged, ...shadowed }
}

/**
 * `upper` wins per key, except where it holds nothing.
 *
 * Not `mergeTranslationChunk`: a `null` leaf is a value to a merge and a miss to
 * `resolveTranslation`, so a dump built by merging reported `null` where `t()` reads the
 * fallback locale's string.
 */
function mergeLayerTrees(lower: Record<string, unknown>, upper: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...lower }
  for (const key of Object.keys(upper)) {
    if (key === '__proto__') continue
    const above = upper[key]
    if (above === null || above === undefined) continue
    const below = result[key]
    result[key] = isPlainTranslationObject(above) && isPlainTranslationObject(below) ? mergeLayerTrees(below, above) : above
  }
  return result
}

/** Leaves of `lower` that `upper` hides behind a scalar, keyed by their dotted path. */
function collectShadowedLeaves(lower: Record<string, unknown>, upper: Record<string, unknown>, prefix: string, out: Record<string, unknown>): void {
  for (const key of Object.keys(lower)) {
    if (key === '__proto__') continue
    const value = lower[key]
    if (!isPlainTranslationObject(value)) continue

    const path = prefix ? `${prefix}.${key}` : key
    const above = upper[key]
    if (isPlainTranslationObject(above)) {
      collectShadowedLeaves(value, above, path, out)
    } else if (above !== undefined && above !== null) {
      // `upper` decided this path is a scalar, so nothing below it survives the merge.
      flattenLeaves(value, path, out)
    }
  }
}

function flattenLeaves(node: Record<string, unknown>, prefix: string, out: Record<string, unknown>): void {
  for (const key of Object.keys(node)) {
    if (key === '__proto__') continue
    const value = node[key]
    const path = `${prefix}.${key}`
    if (isPlainTranslationObject(value)) flattenLeaves(value, path, out)
    else out[path] = value
  }
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
 * Default pluralization function.
 * Fetches the raw `a|b|c` string (no full-string interpolate), selects a form by count,
 * then interpolates only the selected form with `params` + `{count}`.
 */
export const defaultPlural: PluralFunc = (key: TranslationKey, count: number, params: Params, _locale: string, getTranslation: Getter) => {
  // Raw pipe string — pass no params so adapters that forward to `t()` do not interpolate first.
  const translation = getTranslation(key)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  if (forms.length === 0) return null
  const selectedForm = count < forms.length ? forms[count] : forms[forms.length - 1]
  if (!selectedForm) return null
  return interpolate(selectedForm.trim(), { ...params, count })
}
