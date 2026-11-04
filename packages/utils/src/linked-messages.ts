/**
 * Linked messages (`@:key`), resolved once over a merged chunk: the runtime never parses them.
 * Syntax as in vue-i18n: `@:key`, `@.upper:key` / `@.lower:key` / `@.capitalize:key`, and a literal
 * key `@:{'key'}` for a key a bare one cannot spell (one that ends a sentence: `@:{'name'}.`).
 */

type Tree = Record<string, unknown>

export interface LinkedMessagesOptions {
  /** BCP 47 tag the case modifiers go by (`toLocaleUpperCase`): the locale's `iso`, else its code. */
  locale?: string
  /** A message left as written, once per message and reason: a missing key, a cycle, an unknown modifier. */
  warn?: (message: string) => void
}

/** A bare key runs to whitespace or one of `{ } @ % | ( )`, dots included, as vue-i18n reads it. */
const LINK = /@(?:\.([A-Za-z]+))?:(?:\{'([^']*)'\}|([^\s{}@%|()]+))/g

type Modifier = (text: string, tag: string | undefined) => string

const firstOf = (text: string) => (text ? String.fromCodePoint(text.codePointAt(0)!) : '')

const MODIFIERS = new Map<string, Modifier>([
  ['upper', (text, tag) => text.toLocaleUpperCase(tag)],
  ['lower', (text, tag) => text.toLocaleLowerCase(tag)],
  ['capitalize', (text, tag) => firstOf(text).toLocaleUpperCase(tag) + text.slice(firstOf(text).length)],
])

/** A tag `toLocaleUpperCase` takes: an `iso` such as `en_EN` is no BCP 47 tag and would throw. */
function caseTag(tag: string | undefined): string | undefined {
  if (!tag) return undefined
  try {
    'a'.toLocaleUpperCase(tag)
    return tag
  } catch {
    return undefined
  }
}

const isObject = (value: unknown): value is Tree => value !== null && typeof value === 'object'
const own = (node: Tree, key: string): unknown => (key !== '__proto__' && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined)

/** The value `t(key)` reads: an own flat key first, then the dotted walk by own keys. */
function valueAt(tree: Tree, key: string): unknown {
  const flat = own(tree, key)
  if (flat !== undefined && flat !== null) return flat
  let node: unknown = tree
  for (const part of key.split('.')) node = isObject(node) ? own(node, part) : undefined
  return node
}

/** Why a link was left as written. */
interface Failure {
  reason: 'names no message' | 'is a cycle' | 'links a message left as written'
}

const CYCLE: Failure = { reason: 'is a cycle' }
const MISSING: Failure = { reason: 'names no message' }
const BROKEN: Failure = { reason: 'links a message left as written' }

const textOfValue = (value: unknown): string | null => (typeof value === 'string' ? value : typeof value === 'number' ? String(value) : null)

/**
 * `tree` with every linked message resolved; the same object when nothing changed (input never mutated).
 * A message is resolved whole or not at all: any link it cannot resolve leaves it as written. `{name}`
 * params of a linked text stay, and interpolate when the message is read.
 */
export function resolveLinkedMessages(tree: Tree, options: LinkedMessagesOptions = {}): Tree {
  const tag = caseTag(options.locale)
  const warned = new Set<string>()
  const warn = (message: string) => {
    if (warned.has(message)) return
    warned.add(message)
    options.warn?.(message)
  }
  const resolved = new Map<string, string | Failure>()
  const active = new Set<string>()

  const target = (key: string): string | Failure => {
    if (active.has(key)) return CYCLE
    const known = resolved.get(key)
    if (known !== undefined) return known
    const text = textOfValue(valueAt(tree, key))
    const result: string | Failure = text === null ? MISSING : (message(key, text) ?? BROKEN)
    resolved.set(key, result)
    return result
  }

  function message(key: string, text: string): string | null {
    if (!text.includes('@')) return text
    active.add(key)
    let failed = false
    const out = text.replace(LINK, (match, modifier: string | undefined, literal: string | undefined, bare: string | undefined) => {
      const change = modifier === undefined ? undefined : MODIFIERS.get(modifier)
      if (modifier !== undefined && !change) {
        warn(`linked message "${key}": ${match} has an unknown modifier; left as written.`)
        failed = true
        return match
      }
      const linked = target((literal ?? bare)!)
      if (typeof linked !== 'string') {
        // a broken target warned for itself
        if (linked !== BROKEN) warn(`linked message "${key}": ${match} ${linked.reason}; left as written.`)
        failed = true
        return match
      }
      return change ? change(linked, tag) : linked
    })
    active.delete(key)
    return failed ? null : out
  }

  const walk = (node: unknown, path: string): unknown => {
    if (typeof node === 'string') return message(path, node) ?? node
    if (!isObject(node)) return node
    let copy: Tree | unknown[] | null = null
    for (const key of Object.keys(node)) {
      if (key === '__proto__') continue
      const value = (node as Tree)[key]
      const next = walk(value, path ? `${path}.${key}` : key)
      if (next === value) continue
      copy ??= Array.isArray(node) ? [...node] : { ...node }
      ;(copy as Tree)[key] = next
    }
    return copy ?? node
  }

  return walk(tree, '') as Tree
}
