export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]
export interface JsonObject {
  [key: string]: JsonValue
}

export const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value)

const isEmptyObject = (value: unknown): boolean => isObject(value) && Object.keys(value).length === 0

/** `{ a: { b: 'x' } }` -> `{ 'a.b': 'x' }`. Arrays and empty objects are leaves. */
export function flatten(tree: JsonObject, prefix = '', out: Record<string, JsonValue> = {}): Record<string, JsonValue> {
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (isObject(value) && !isEmptyObject(value)) flatten(value, path, out)
    else out[path] = value
  }
  return out
}

/** Only the string leaves: the part of a tree that is text to translate. */
export function flattenStrings(tree: JsonObject): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(flatten(tree))) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}

/**
 * The object and key holding `path`. Dotted names are valid keys and the runtime reads them
 * first, so `{ "a.b": 1 }` and `{ a: { "b.c": 1 } }` resolve like nested ones.
 */
function locate(tree: JsonObject, path: string): [JsonObject, string] | null {
  if (Object.hasOwn(tree, path)) return [tree, path]
  for (let index = path.indexOf('.'); index !== -1; index = path.indexOf('.', index + 1)) {
    const head = path.slice(0, index)
    const child = Object.hasOwn(tree, head) ? tree[head] : undefined
    const found = isObject(child) ? locate(child, path.slice(index + 1)) : null
    if (found) return found
  }
  return null
}

export function getPath(tree: JsonObject, path: string): JsonValue | undefined {
  const found = locate(tree, path)
  return found ? found[0][found[1]] : undefined
}

/** The leaf a new `path` would have to replace: `a` when `a` is text and `a.b` is wanted. */
function blockingLeaf(tree: JsonObject, path: string): string | null {
  const parts = path.split('.')
  for (let length = 1; length < parts.length; length += 1) {
    const prefix = parts.slice(0, length).join('.')
    const value = getPath(tree, prefix)
    if (value !== undefined && !isObject(value)) return prefix
  }
  return null
}

/**
 * What writing `path` would destroy: a text above it, or the keys below it. Every write that
 * comes from outside the file (import, pull, translation, generated key) asks this first.
 */
export function pathConflict(tree: JsonObject, path: string): string | null {
  const current = getPath(tree, path)
  if (current === undefined) return blockingLeaf(tree, path)
  return isObject(current) && !isEmptyObject(current) ? path : null
}

/** What can go between quotes in a template and a script, and be stored. */
export const isWritableKey = (key: string): boolean =>
  !/['"`\\\r\n]|\}\}|\$\{|&#?\w+;/.test(key) && key.split('.').every((segment) => segment !== '' && segment !== '__proto__')

export function setPath(tree: JsonObject, path: string, value: JsonValue): void {
  const found = locate(tree, path)
  if (found) {
    found[0][found[1]] = value
    return
  }
  const parts = path.split('.')
  const last = parts.pop()!
  if ([...parts, last].includes('__proto__')) return
  let current = tree
  for (const part of parts) {
    if (!isObject(current[part])) current[part] = {}
    current = current[part]
  }
  current[last] = value
}

/** Remove one leaf and the parents it leaves empty. Everything else stays exactly as written. */
export function deletePath(tree: JsonObject, path: string): boolean {
  if (Object.hasOwn(tree, path)) return delete tree[path]
  for (let index = path.indexOf('.'); index !== -1; index = path.indexOf('.', index + 1)) {
    const head = path.slice(0, index)
    const child = Object.hasOwn(tree, head) ? tree[head] : undefined
    if (!isObject(child) || !deletePath(child, path.slice(index + 1))) continue
    if (isEmptyObject(child)) delete tree[head]
    return true
  }
  return false
}

/** The string is unrolled: an alternation in a loop overflows the regexp stack on a value of megabytes. */
const JSON_TOKEN = /"[^"\\]*(?:\\.[^"\\]*)*"|[{}[\]:]/g

/** The first key an object repeats. `JSON.parse` keeps the last and says nothing, and a save would lose the other. */
export function findDuplicateKey(text: string): string | null {
  const stack: Array<Set<string> | null> = []
  let lastString = ''
  for (const [token] of text.matchAll(JSON_TOKEN)) {
    if (token === '{') stack.push(new Set())
    else if (token === '[') stack.push(null)
    else if (token === '}' || token === ']') stack.pop()
    else if (token !== ':') lastString = token.includes('\\') ? (JSON.parse(token) as string) : token.slice(1, -1)
    else if (stack.at(-1)?.has(lastString)) return lastString
    else stack.at(-1)?.add(lastString)
  }
  return null
}

/** The merge and the writers skip this key, so it would vanish on a save. */
export function hasProtoKey(value: JsonValue): boolean {
  if (typeof value !== 'object' || value === null) return false
  return Object.hasOwn(value, '__proto__') || Object.values(value).some(hasProtoKey)
}

/** The path of an integer `JSON.parse` could not hold exactly. */
export function findUnsafeInteger(value: JsonValue, path = ''): string | null {
  if (typeof value === 'number') return Number.isInteger(value) && !Number.isSafeInteger(value) ? path : null
  if (typeof value !== 'object' || value === null) return null
  for (const [key, child] of Object.entries(value)) {
    const found = findUnsafeInteger(child, path ? `${path}.${key}` : key)
    if (found !== null) return found
  }
  return null
}

/** `Map.groupBy`, which Node 20 does not have. */
export function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    if (groups.has(key)) groups.get(key)!.push(item)
    else groups.set(key, [item])
  }
  return groups
}

export function sortKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (!isObject(value)) return value
  const sorted: JsonObject = {}
  for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b, 'en'))) sorted[key] = sortKeys(value[key]!)
  return sorted
}
