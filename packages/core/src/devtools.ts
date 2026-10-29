import type { Locale, Translations } from '@i18n-micro/types'
import type { TranslationStorage } from './storage'
import { collectTranslationPaths, isTree, type Tree } from './tree'

export interface I18nDevtoolsInspectorNode {
  id: string
  label: string
  children?: I18nDevtoolsInspectorNode[]
  tags?: Array<{
    label: string
    textColor: number
    backgroundColor: number
    tooltip?: string
  }>
}

export interface I18nDevtoolsStateSnapshot {
  locale: string
  routeName: string
  strategy?: string
  defaultLocale?: string
  fallbackLocale?: string
  cachedChunks: number
  locales: Array<{ code: string; displayName?: string; disabled?: boolean }>
}

export interface BuildInspectorTreeOptions {
  nodeId: string
  storage: TranslationStorage
  configuredLocales: Locale[]
  activeLocale: string
  activeRouteName: string
  activeTranslations?: Record<string, unknown>
}

type ParsedNode = ReturnType<typeof parseInspectorNodeId>

const ACTIVE_TAG = {
  label: 'Active',
  textColor: 0xffffff,
  backgroundColor: 0x42b883,
  tooltip: 'Current locale and route context',
}
const LOCALE_TAG = { ...ACTIVE_TAG, tooltip: 'Active locale' }

const PREFIX_LOCALE = 'locale|'
const PREFIX_CHUNK = 'chunk|'
const PREFIX_KEY = 'key|'

function formatInspectorValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) return `[Array(${value.length})]`
  if (value !== null && typeof value === 'object') return '{…}'
  return String(value)
}

/** Route names per locale, sorted, from one pass over the storage keys. */
function routesByLocale(storage: TranslationStorage): Map<string, string[]> {
  const routes = new Map<string, Set<string>>()
  for (const key of storage.translations.keys()) {
    const colon = key.indexOf(':')
    const locale = colon === -1 ? key : key.slice(0, colon)
    const route = (colon === -1 ? '' : key.slice(colon + 1)) || 'index'
    if (!routes.has(locale)) routes.set(locale, new Set())
    routes.get(locale)!.add(route)
  }
  return new Map([...routes].map(([locale, names]) => [locale, [...names].sort()]))
}

/** Encode path segments so a literal key `"a.b"` and the nested path `a → b` get distinct ids. */
export function encodeInspectorPath(segments: string[]): string {
  return segments.map(encodeURIComponent).join('/')
}

export function decodeInspectorPath(encoded: string): string[] {
  return encoded ? encoded.split('/').map(decodeURIComponent) : []
}

export function getByInspectorPath(obj: Record<string, unknown>, segments: string[]): unknown {
  let node: unknown = obj
  for (const segment of segments) {
    if (!isTree(node) || !Object.prototype.hasOwnProperty.call(node, segment)) return undefined
    node = node[segment]
  }
  return node
}

export function parseInspectorNodeId(nodeId: string): {
  kind: 'root' | 'active' | 'locale' | 'chunk' | 'key'
  locale?: string
  routeName?: string
  path?: string
  segments?: string[]
} {
  if (nodeId === 'active') return { kind: 'active' }
  if (nodeId.startsWith(PREFIX_LOCALE)) return { kind: 'locale', locale: nodeId.slice(PREFIX_LOCALE.length) }
  if (nodeId.startsWith(PREFIX_CHUNK)) {
    const [locale = '', routeName = 'index'] = nodeId.slice(PREFIX_CHUNK.length).split('|')
    return { kind: 'chunk', locale, routeName }
  }
  if (!nodeId.startsWith(PREFIX_KEY)) return { kind: 'root' }
  const [locale = '', routeName = 'index', ...rest] = nodeId.slice(PREFIX_KEY.length).split('|')
  const path = rest.join('|')
  return { kind: 'key', locale, routeName, path, segments: decodeInspectorPath(path) }
}

export function flattenTranslationNode(obj: Record<string, unknown>, parentSegments: string[] = []): I18nDevtoolsInspectorNode[] {
  const target = getByInspectorPath(obj, parentSegments)
  if (!isTree(target)) return []
  return Object.keys(target)
    .filter((key) => key !== '__proto__')
    .map((key) => {
      const nested = isTree(target[key])
      return {
        id: `${PREFIX_KEY}${encodeInspectorPath([...parentSegments, key])}`,
        label: nested ? key : `${key}: ${formatInspectorValue(target[key])}`,
        children: nested ? [] : undefined,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Key nodes of `source` under `segments`, with ids scoped to their chunk. */
function keyNodes(locale: string, routeName: string, source: Record<string, unknown>, segments: string[] = []): I18nDevtoolsInspectorNode[] {
  const scope = `${PREFIX_KEY}${locale}|${routeName}|`
  // the nodes are fresh objects: rescoping them in place costs no copies
  const nodes = flattenTranslationNode(source, segments)
  for (const node of nodes) node.id = scope + node.id.slice(PREFIX_KEY.length)
  return nodes
}

function chunkTag(locale: string, routeName: string, options: BuildInspectorTreeOptions, activeRoute: string) {
  return locale === options.activeLocale && routeName === activeRoute ? [ACTIVE_TAG] : undefined
}

function rootNodes(options: BuildInspectorTreeOptions, activeRoute: string): I18nDevtoolsInspectorNode[] {
  const routes = routesByLocale(options.storage)
  const codes = [...new Set([...options.configuredLocales.map((locale) => locale.code), ...routes.keys()])].filter(Boolean).sort()
  const nodes: I18nDevtoolsInspectorNode[] = [{ id: 'active', label: `Active (${options.activeLocale}:${activeRoute})`, tags: [ACTIVE_TAG] }]
  for (const code of codes) {
    const displayName = options.configuredLocales.find((locale) => locale.code === code)?.displayName
    nodes.push({
      id: `${PREFIX_LOCALE}${code}`,
      label: displayName ? `${code} (${displayName})` : code,
      tags: code === options.activeLocale ? [LOCALE_TAG] : undefined,
    })
    // Chunks sit flat at the root beside their locale: Vue DevTools selects nested custom-inspector children unreliably.
    for (const routeName of routes.get(code) ?? [])
      nodes.push({ id: `${PREFIX_CHUNK}${code}|${routeName}`, label: `${code}:${routeName}`, tags: chunkTag(code, routeName, options, activeRoute) })
  }
  return nodes
}

function chunkOf(options: BuildInspectorTreeOptions, locale: string, routeName: string): Tree {
  return (options.storage.translations.get(`${locale}:${routeName}`) ?? {}) as Tree
}

const builders: Record<
  ParsedNode['kind'],
  (options: BuildInspectorTreeOptions, node: ParsedNode, activeRoute: string) => I18nDevtoolsInspectorNode[]
> = {
  root: (options, _node, activeRoute) => rootNodes(options, activeRoute),
  active: (options, _node, activeRoute) => keyNodes(options.activeLocale, activeRoute, options.activeTranslations ?? {}),
  locale: (options, { locale = '' }, activeRoute) =>
    (routesByLocale(options.storage).get(locale) ?? []).map((routeName) => ({
      id: `${PREFIX_CHUNK}${locale}|${routeName}`,
      label: routeName,
      children: [],
      tags: chunkTag(locale, routeName, options, activeRoute),
    })),
  chunk: (options, { locale = '', routeName = 'index' }) => keyNodes(locale, routeName || 'index', chunkOf(options, locale, routeName || 'index')),
  key: (options, { locale = '', routeName = 'index', segments = [] }, activeRoute) => {
    const route = routeName || 'index'
    const chunk = options.storage.translations.get(`${locale}:${route}`) as Tree | undefined
    const isActive = locale === options.activeLocale && route === activeRoute
    return keyNodes(locale, route, (isActive ? options.activeTranslations : undefined) ?? chunk ?? {}, segments)
  },
}

export function buildInspectorTree(options: BuildInspectorTreeOptions): I18nDevtoolsInspectorNode[] {
  const node = parseInspectorNodeId(options.nodeId)
  // A locale/chunk/key node without a locale has nothing under it.
  if (node.kind !== 'root' && node.kind !== 'active' && !node.locale) return []
  return builders[node.kind](options, node, options.activeRouteName || 'index')
}

export function buildInspectorState(snapshot: I18nDevtoolsStateSnapshot): Record<string, Array<{ key: string; value: unknown; editable?: boolean }>> {
  return {
    Context: [
      { key: 'locale', value: snapshot.locale },
      { key: 'routeName', value: snapshot.routeName },
      { key: 'strategy', value: snapshot.strategy ?? '—' },
      { key: 'defaultLocale', value: snapshot.defaultLocale ?? '—' },
      { key: 'fallbackLocale', value: snapshot.fallbackLocale ?? '—' },
      { key: 'cachedChunks', value: snapshot.cachedChunks },
    ],
    Locales: snapshot.locales.map((locale) => ({ key: locale.code, value: locale.displayName ?? locale.code, editable: false })),
  }
}

/** Number of distinct dotted paths (objects and leaves) in a tree. */
export function countTranslationKeys(translations: Translations | Record<string, unknown> | undefined): number {
  if (!isTree(translations)) return 0
  const paths = new Set<string>()
  collectTranslationPaths(translations, paths)
  return paths.size
}
