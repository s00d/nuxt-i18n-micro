/**
 * Translation trees: plain JSON objects whose leaves are strings, numbers, arrays, null.
 *
 * Keys are read the way `t()` reads them: an own flat key (`'a.b': 'x'`) wins over the dotted
 * walk. `__proto__` is never read through or written, so no tree can reach a prototype.
 */

export type Tree = Record<string, unknown>

const hasOwn = (obj: object, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key)

export function isTree(value: unknown): value is Tree {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * `obj[key]` if it is the object's own, in one property lookup on the hot path. Only a value
 * an object could have inherited (a function, `__proto__`, or the value `Object.prototype`
 * holds, e.g. after prototype pollution) is double-checked with `hasOwnProperty`.
 */
export function ownValue(obj: object, key: string): unknown {
  const value = (obj as Tree)[key]
  if (value === undefined) return undefined
  const maybeInherited = typeof value === 'function' || key === '__proto__' || value === (Object.prototype as Tree)[key]
  return maybeInherited && !hasOwn(obj, key) ? undefined : value
}

/** Own flat key first, then the dotted walk: objects by own key, arrays by index (`list.0`, never `list.length`). */
export function getByPath(obj: Tree | null | undefined, path: string): unknown {
  if (!obj || typeof path !== 'string' || path === '') return undefined
  const flat = ownValue(obj, path)
  if (flat !== undefined || path.indexOf('.') === -1) return flat
  let node: unknown = obj
  for (const part of path.split('.')) {
    if (node === null || typeof node !== 'object' || (part === 'length' && Array.isArray(node))) return undefined
    node = ownValue(node, part)
  }
  return node
}

/** `getByPath`, with "nothing there" (missing or `undefined`) as `null`. */
export function resolveTranslation(obj: Tree | null | undefined, key: string): unknown | null {
  const value = getByPath(obj, key)
  return value === undefined ? null : value
}

export function hasTranslationValue(obj: Tree | null | undefined, key: string): boolean {
  return resolveTranslation(obj, key) !== null
}

/**
 * A copy of `tree` with `key` set to `value` (replaced, not merged). Only the nodes along the
 * path are copied; a non-object on the way becomes `{}`. An existing flat key is updated as is.
 */
export function setTranslationAtKey(tree: Tree, key: string, value: unknown): Tree {
  if (typeof key !== 'string' || key === '' || key === '__proto__') return tree
  if (hasOwn(tree, key) || key.indexOf('.') === -1) return { ...tree, [key]: value }
  const path = key.split('.')
  if (path.includes('__proto__')) return tree
  const root: Tree = { ...tree }
  const last = path.pop()!
  let node = root
  for (const segment of path) {
    const next: Tree = isTree(node[segment]) ? { ...(node[segment] as Tree) } : {}
    node[segment] = next
    node = next
  }
  node[last] = value
  return root
}

export interface MergeTranslationChunkOptions {
  /** When true, existing keys win over incoming. Default: incoming wins. */
  preserveExisting?: boolean
}

/**
 * Deep merge of two trees into a new one; neither input is changed. Nested objects merge,
 * everything else (arrays, scalars, null) replaces. Only nodes on the patch's paths are copied.
 */
export function mergeTranslationChunk(existing: Tree, incoming: Tree, options?: MergeTranslationChunkOptions): Tree {
  // a copy: the result is a stored tree from now on, and the caller still owns `incoming`
  if (Object.keys(existing).length === 0) return { ...incoming }
  const owned = new WeakSet<object>()
  const root = own(existing, owned)
  mergeInto(root, incoming, owned, options?.preserveExisting === true)
  return root
}

/** `node` if this merge already copied it, otherwise its copy (now owned). */
function own(node: Tree, owned: WeakSet<object>): Tree {
  if (owned.has(node)) return node
  const copy = { ...node }
  owned.add(copy)
  return copy
}

/** Merges `source` into the owned `target`; a nested node not yet owned is copied before it is written. */
function mergeInto(target: Tree, source: Tree, owned: WeakSet<object>, keepExisting: boolean): void {
  for (const key of Object.keys(source)) {
    if (key !== '__proto__') target[key] = mergeValue(target, key, source[key], owned, keepExisting)
  }
}

function mergeValue(target: Tree, key: string, incoming: unknown, owned: WeakSet<object>, keepExisting: boolean): unknown {
  const existing = target[key]
  if (isTree(existing) && isTree(incoming)) {
    const node = own(existing, owned)
    mergeInto(node, incoming, owned, keepExisting)
    return node
  }
  return keepExisting && hasOwn(target, key) ? existing : incoming
}

/**
 * Two live layers (`upper` wins) as one tree that answers every key `t()` answers through them.
 * A `null`/`undefined` in `upper` falls through. Where `upper` holds a scalar over an object
 * of `lower`, that object's leaves come back as flat dotted keys (`getByPath` reads them first).
 */
export function mergeTranslationLayers(lower: Tree, upper: Tree): Tree {
  const shadowed: Tree = {}
  const merged = layer(lower, upper, '', shadowed, new Set())
  return Object.keys(shadowed).length === 0 ? merged : { ...merged, ...shadowed }
}

/**
 * The walkers below carry their ancestors: a tree from JSON has no cycles, but an object passed in
 * by code can, and a cycle is cut there instead of overflowing the stack. Ancestors, not a visited
 * set: the same subtree under two keys is two paths.
 */
function layer(lower: Tree, upper: Tree, prefix: string, shadowed: Tree, ancestors: Set<object>): Tree {
  const result: Tree = { ...lower }
  if (ancestors.has(upper) || ancestors.has(lower)) return result
  ancestors.add(upper).add(lower)
  for (const key of Object.keys(upper)) {
    const above = upper[key]
    if (key !== '__proto__' && above !== null && above !== undefined)
      result[key] = layerValue(lower[key], above, join(prefix, key), shadowed, ancestors)
  }
  ancestors.delete(upper)
  ancestors.delete(lower)
  return result
}

function layerValue(below: unknown, above: unknown, path: string, shadowed: Tree, ancestors: Set<object>): unknown {
  if (!isTree(below)) return above
  if (isTree(above)) return layer(below, above, path, shadowed, ancestors)
  flatten(below, path, shadowed, ancestors)
  return above
}

function flatten(node: Tree, prefix: string, out: Tree, ancestors: Set<object>): void {
  if (ancestors.has(node)) return
  ancestors.add(node)
  for (const key of Object.keys(node)) {
    const value = node[key]
    const path = `${prefix}.${key}`
    if (key === '__proto__') continue
    if (isTree(value)) flatten(value, path, out, ancestors)
    else out[path] = value
  }
  ancestors.delete(node)
}

const join = (prefix: string, key: string): string => (prefix ? `${prefix}.${key}` : key)

/** Adds every path of `obj` (objects and leaves, dotted) to `paths`. Arrays are leaves; a cycle is cut. */
export function collectTranslationPaths(obj: Tree, paths: Set<string>, prefix = '', ancestors: Set<object> = new Set()): void {
  if (ancestors.has(obj)) return
  ancestors.add(obj)
  for (const key of Object.keys(obj)) {
    if (key === '__proto__') continue
    const path = join(prefix, key)
    paths.add(path)
    if (isTree(obj[key])) collectTranslationPaths(obj[key] as Tree, paths, path, ancestors)
  }
  ancestors.delete(obj)
}
