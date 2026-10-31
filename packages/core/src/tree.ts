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
  // `null` means nothing there, in a flat key too: the nesting may still hold it
  if ((flat !== undefined && flat !== null) || path.indexOf('.') === -1) return flat
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
 * path are copied; an array keeps its items when the next segment is an index (`list.1`, as
 * `getByPath` reads it), and any other non-object on the way becomes `{}`. An existing flat key is updated as is.
 */
export function setTranslationAtKey(tree: Tree, key: string, value: unknown): Tree {
  if (typeof key !== 'string' || key === '' || key === '__proto__') return tree
  if (hasOwn(tree, key) || key.indexOf('.') === -1) return { ...tree, [key]: value }
  const path = key.split('.')
  if (path.includes('__proto__')) return tree
  const root: Tree = { ...tree }
  let node = root
  for (let i = 0; i < path.length - 1; i++) {
    const next = copyNode(node[path[i]!], path[i + 1]!)
    node[path[i]!] = next
    node = next
  }
  node[path[path.length - 1]!] = value
  return root
}

function copyNode(node: unknown, nextSegment: string): Tree {
  if (Array.isArray(node) && /^\d+$/.test(nextSegment)) return [...node] as unknown as Tree
  return isTree(node) ? { ...node } : {}
}

export interface MergeTranslationChunkOptions {
  /** When true, existing keys win over incoming. Default: incoming wins. */
  preserveExisting?: boolean
}

/**
 * Deep merge of two trees into a new one; neither input is changed, and the result shares
 * nothing with `incoming`. Nested objects merge, everything else (arrays, scalars, null) replaces.
 * Of `existing`, only nodes on the patch's paths are copied.
 */
export function mergeTranslationChunk(existing: Tree, incoming: Tree, options?: MergeTranslationChunkOptions): Tree {
  // a copy: the result is a stored tree from now on, and the caller still owns `incoming`
  if (Object.keys(existing).length === 0) return copyValue(incoming, new WeakMap()) as Tree
  const owned = new WeakSet<object>()
  const root = own(existing, owned)
  mergeInto(root, incoming, owned, options?.preserveExisting === true, new WeakMap())
  return root
}

/**
 * A stored copy of a caller's value, at every level, arrays too: the caller still owns it, and the
 * leaf cache must not disagree with its tree. `JSON.parse` makes `__proto__` an own key, a merge
 * never keeps it. Aliased nodes stay aliased, a cycle stays a cycle.
 * ponytail: copies every incoming node once on load (O(keys of the patch)), never on `t()`.
 */
function copyValue(value: unknown, copies: Copies): unknown {
  if (value === null || typeof value !== 'object') return value
  const known = copies.get(value)
  if (known) return known
  if (Array.isArray(value)) {
    const items: unknown[] = []
    copies.set(value, items)
    for (const item of value) items.push(copyValue(item, copies))
    return items
  }
  const copy: Tree = {}
  copies.set(value, copy)
  for (const key of Object.keys(value)) {
    if (key !== '__proto__') copy[key] = copyValue((value as Tree)[key], copies)
  }
  return copy
}

type Copies = WeakMap<object, object>

/** `node` if this merge already copied it, otherwise its copy (now owned). */
function own(node: Tree, owned: WeakSet<object>): Tree {
  if (owned.has(node)) return node
  const copy = { ...node }
  owned.add(copy)
  return copy
}

/** Merges `source` into the owned `target`; a nested node not yet owned is copied before it is written. */
function mergeInto(target: Tree, source: Tree, owned: WeakSet<object>, keepExisting: boolean, copies: Copies): void {
  for (const key of Object.keys(source)) {
    if (key !== '__proto__') target[key] = mergeValue(target, key, source[key], owned, keepExisting, copies)
  }
}

function mergeValue(target: Tree, key: string, incoming: unknown, owned: WeakSet<object>, keepExisting: boolean, copies: Copies): unknown {
  const existing = target[key]
  if (isTree(existing) && isTree(incoming)) {
    const node = own(existing, owned)
    mergeInto(node, incoming, owned, keepExisting, copies)
    return node
  }
  return keepExisting && hasOwn(target, key) ? existing : copyValue(incoming, copies)
}

/**
 * Two live layers (`upper` wins) as one tree that answers every key `t()` answers through them.
 * A `null`/`undefined` in `upper` falls through. Where `upper` replaces an object or an array of
 * `lower`, its leaves come back as flat dotted keys (`getByPath` reads them first), but for the ones `upper` answers itself.
 */
export function mergeTranslationLayers(lower: Tree, upper: Tree): Tree {
  const shadowed: Tree = {}
  const merged = layer(lower, upper, '', shadowed, new Set())
  // a flat key wins in `getByPath`: a lower one must not hide what `upper` answers through its nesting
  for (const key of Object.keys(lower)) {
    if (key.includes('.') && !hasOwn(upper, key) && hasTranslationValue(upper, key)) delete merged[key]
  }
  for (const key of Object.keys(shadowed)) {
    if (hasTranslationValue(upper, key)) delete shadowed[key]
  }
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
  if (isTree(below) && isTree(above)) return layer(below, above, path, shadowed, ancestors)
  if (isNode(below)) flatten(below, path, shadowed, ancestors)
  return above
}

/** A tree or an array: what the dotted walk goes through. */
const isNode = (value: unknown): value is Tree => value !== null && typeof value === 'object'

function flatten(node: Tree, prefix: string, out: Tree, ancestors: Set<object>): void {
  if (ancestors.has(node)) return
  ancestors.add(node)
  for (const key of Object.keys(node)) {
    const value = node[key]
    const path = `${prefix}.${key}`
    if (key === '__proto__') continue
    // an array is a value of its own and a node of the walk
    if (!isTree(value)) out[path] = value
    if (isNode(value)) flatten(value, path, out, ancestors)
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
