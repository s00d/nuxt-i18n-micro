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
export function blockingLeaf(tree: JsonObject, path: string): string | null {
  const parts = path.split('.')
  for (let length = 1; length < parts.length; length += 1) {
    const prefix = parts.slice(0, length).join('.')
    const value = getPath(tree, prefix)
    if (value !== undefined && !isObject(value)) return prefix
  }
  return null
}

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

export function unflatten(flat: Record<string, JsonValue>): JsonObject {
  const out: JsonObject = {}
  for (const [key, value] of Object.entries(flat)) setPath(out, key, value)
  return out
}

export function sortKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (!isObject(value)) return value
  const sorted: JsonObject = {}
  for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b, 'en'))) sorted[key] = sortKeys(value[key]!)
  return sorted
}
