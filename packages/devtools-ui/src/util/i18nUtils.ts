import type { TreeNode } from '../types'

/** Array elements are keyed `[]<index>`: `rows.[]0.label`, `tags.[]1`. */
const ARRAY_PART = /^\[\](\d+)$/

/**
 * An empty array or object has no leaf to show, so it is kept as this value and restored on save.
 * A translation that is literally `[]` / `{}` shows with a leading `\\` (`\\[]`, and `\\\\[]` for `\\[]`) and is restored as text.
 */
const EMPTY_CONTAINER: Record<string, () => unknown> = { '[]': () => [], '{}': () => ({}) }

const ESCAPED_MARKER = /^\\+(?:\[\]|\{\})$/
const looksLikeMarker = (value: string): boolean => Object.prototype.hasOwnProperty.call(EMPTY_CONTAINER, value) || ESCAPED_MARKER.test(value)

const isEmptyContainer = (value: unknown): value is object => typeof value === 'object' && value !== null && Object.keys(value).length === 0

/** A plain write, except that `__proto__` becomes an own data key (as JSON.parse makes it) instead of a prototype write. */
function setOwn(node: Record<string | number, unknown>, key: string | number, value: unknown): void {
  Object.defineProperty(node, key, { value, writable: true, enumerable: true, configurable: true })
}

function flattenValue(value: unknown, key: string, result: Record<string, string>): void {
  if (isEmptyContainer(value)) {
    setOwn(result, key, Array.isArray(value) ? '[]' : '{}')
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenValue(item, `${key}.[]${index}`, result))
    return
  }
  if (typeof value === 'object' && value !== null) {
    flattenTranslations(value as Record<string, unknown>, key, result)
    return
  }
  const text = value?.toString() ?? ''
  setOwn(result, key, typeof value === 'string' && looksLikeMarker(text) ? `\\${text}` : text)
}

export function flattenTranslations(obj: Record<string, unknown>, parentKey = '', result: Record<string, string> = {}): Record<string, string> {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue
    flattenValue(obj[key], parentKey ? `${parentKey}.${key}` : key, result)
  }
  return result
}

/** The object key or array index a path part addresses. */
const slot = (part: string): string | number => {
  const index = ARRAY_PART.exec(part)
  return index ? Number(index[1]) : part
}

/** Keeps the parts that address something: no empty segments, no malformed `[]` indexes. */
const usablePart = (part: string) => part !== '' && (!part.startsWith('[]') || ARRAY_PART.test(part))

/** The table holds strings: restore booleans and numbers, keep blank strings as strings. */
const parseValue = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  if (ESCAPED_MARKER.test(value)) return value.slice(1)
  if (Object.prototype.hasOwnProperty.call(EMPTY_CONTAINER, value)) return EMPTY_CONTAINER[value]!()
  if (value === 'true' || value === 'false') return value === 'true'
  return value.trim() !== '' && !Number.isNaN(Number(value)) ? Number(value) : value
}

/** The container under `part`, created as an array when the next part is an index. */
function childOf(node: Record<string | number, unknown>, part: string, next: string): Record<string | number, unknown> {
  const key = slot(part)
  // own keys only: an inherited `__proto__` is Object.prototype, not a container of the file
  const existing = Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined
  if (typeof existing === 'object' && existing !== null) return existing as Record<string | number, unknown>
  const created = ARRAY_PART.test(next) ? [] : {}
  setOwn(node, key, created)
  return created as Record<string | number, unknown>
}

export const unflattenTranslations = <T = Record<string, unknown>>(flat: Record<string, string>): T => {
  const result: Record<string | number, unknown> = {}

  for (const key in flat) {
    if (!Object.prototype.hasOwnProperty.call(flat, key)) continue
    const parts = key.split('.').filter(usablePart)
    if (parts.length === 0) continue
    const node = parts.slice(0, -1).reduce((parent, part, i) => childOf(parent, part, parts[i + 1]!), result)
    setOwn(node, slot(parts[parts.length - 1]!), parseValue(flat[key]))
  }

  return result as T
}

/** The folders every file sits in (`pages/about` for `pages/about/{en,de}.json`); the tree starts below it. */
function commonFolder(files: string[]): string {
  const folders = files.map((file) => file.split('/').slice(0, -1))
  const first = folders[0] ?? []
  const depth = first.findIndex((segment, i) => !segment || folders.some((folder) => folder[i] !== segment))
  return first.slice(0, depth === -1 ? first.length : depth).join('/')
}

function childNode(parent: TreeNode, name: string, file: string | undefined): TreeNode {
  const existing = parent.children.find((node) => node.name === name)
  if (existing) return existing
  const fullPath = file ?? (parent.fullPath ? `${parent.fullPath}/${name}` : name)
  const node: TreeNode = { name, fullPath, isFile: file !== undefined, children: [] }
  parent.children.push(node)
  return node
}

/** Folders first, then by name, at every level. */
function sortTree(nodes: TreeNode[]): TreeNode[] {
  nodes.sort((a, b) => (a.isFile === b.isFile ? a.name.localeCompare(b.name) : a.isFile ? 1 : -1))
  nodes.forEach((node) => sortTree(node.children))
  return nodes
}

/**
 * The file tree of the listed translation files. A file node's `fullPath` is its listed key
 * (`de.json`, `pages/about/de.json`), so selecting it opens, saves and refreshes that same key.
 */
export function buildFileTree(files: string[]): TreeNode[] {
  const root: TreeNode = { name: '', fullPath: commonFolder(files), isFile: false, children: [] }
  for (const file of files) {
    const parts = file.slice(root.fullPath.length).split('/').filter(Boolean)
    parts.reduce((parent, part, i) => childNode(parent, part, i === parts.length - 1 ? file : undefined), root)
  }
  return sortTree(root.children)
}
