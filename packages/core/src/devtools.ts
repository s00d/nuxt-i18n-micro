import type { Locale, Translations } from '@i18n-micro/types'
import type { TranslationStorage } from './translation'

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

const ACTIVE_TAG = {
  label: 'Active',
  textColor: 0xffffff,
  backgroundColor: 0x42b883,
  tooltip: 'Current locale and route context',
}

const NODE_ROOT = 'root'
const NODE_ACTIVE = 'active'
const PREFIX_LOCALE = 'locale|'
const PREFIX_CHUNK = 'chunk|'
const PREFIX_KEY = 'key|'

const isPlainObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

function formatInspectorValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') return Array.isArray(value) ? `[Array(${value.length})]` : '{…}'
  return String(value)
}

function activeChunkTag(locale: string, routeName: string, activeLocale: string, activeRouteName: string) {
  return locale === activeLocale && routeName === activeRouteName ? [ACTIVE_TAG] : undefined
}

function collectRouteNamesForLocale(storage: TranslationStorage, locale: string): string[] {
  const prefix = `${locale}:`
  const routes = new Set<string>()

  for (const key of storage.translations.keys()) {
    if (!key.startsWith(prefix)) continue
    routes.add(key.slice(prefix.length) || 'index')
  }

  return [...routes].sort()
}

function collectLocaleCodes(storage: TranslationStorage, configuredLocales: Locale[]): string[] {
  const codes = new Set(configuredLocales.map((locale) => locale.code))

  for (const key of storage.translations.keys()) {
    const locale = key.split(':')[0]
    if (locale) codes.add(locale)
  }

  return [...codes].sort()
}

/**
 * Encode path segments so a literal key `"a.b"` and nested path `a → b` get distinct node IDs.
 */
export function encodeInspectorPath(segments: string[]): string {
  return segments.map((segment) => encodeURIComponent(segment)).join('/')
}

export function decodeInspectorPath(encoded: string): string[] {
  if (!encoded) return []
  return encoded.split('/').map((segment) => decodeURIComponent(segment))
}

export function getByInspectorPath(obj: Record<string, unknown>, segments: string[]): unknown {
  let current: unknown = obj
  for (const segment of segments) {
    if (!isPlainObject(current) || !Object.prototype.hasOwnProperty.call(current, segment)) return undefined
    current = current[segment]
  }
  return current
}

export function parseInspectorNodeId(nodeId: string): {
  kind: 'root' | 'active' | 'locale' | 'chunk' | 'key'
  locale?: string
  routeName?: string
  path?: string
  segments?: string[]
} {
  if (!nodeId || nodeId === NODE_ROOT) return { kind: 'root' }
  if (nodeId === NODE_ACTIVE) return { kind: 'active' }

  if (nodeId.startsWith(PREFIX_LOCALE)) {
    return { kind: 'locale', locale: nodeId.slice(PREFIX_LOCALE.length) }
  }

  if (nodeId.startsWith(PREFIX_CHUNK)) {
    const [locale = '', routeName = 'index'] = nodeId.slice(PREFIX_CHUNK.length).split('|')
    return { kind: 'chunk', locale, routeName }
  }

  if (nodeId.startsWith(PREFIX_KEY)) {
    const parts = nodeId.slice(PREFIX_KEY.length).split('|')
    const locale = parts[0] ?? ''
    const routeName = parts[1] ?? 'index'
    const path = parts.slice(2).join('|')
    return { kind: 'key', locale, routeName, path, segments: decodeInspectorPath(path) }
  }

  return { kind: 'root' }
}

function withKeyPrefix(locale: string, routeName: string, node: I18nDevtoolsInspectorNode): I18nDevtoolsInspectorNode {
  return {
    ...node,
    id: `${PREFIX_KEY}${locale}|${routeName}|${node.id.slice(PREFIX_KEY.length)}`,
  }
}

export function flattenTranslationNode(obj: Record<string, unknown>, parentSegments: string[] = []): I18nDevtoolsInspectorNode[] {
  const target = parentSegments.length === 0 ? obj : getByInspectorPath(obj, parentSegments)
  if (!isPlainObject(target)) return []

  return Object.keys(target)
    .filter((key) => key !== '__proto__')
    .map((key) => {
      const segments = [...parentSegments, key]
      const value = target[key]
      const nested = isPlainObject(value)

      return {
        id: `${PREFIX_KEY}${encodeInspectorPath(segments)}`,
        label: nested ? key : `${key}: ${formatInspectorValue(value)}`,
        children: nested ? [] : undefined,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function buildInspectorTree(options: BuildInspectorTreeOptions): I18nDevtoolsInspectorNode[] {
  const parsed = parseInspectorNodeId(options.nodeId)
  const activeLocale = options.activeLocale
  const activeRoute = options.activeRouteName || 'index'

  if (parsed.kind === 'root') {
    const locales = collectLocaleCodes(options.storage, options.configuredLocales)
    const nodes: I18nDevtoolsInspectorNode[] = [
      {
        id: NODE_ACTIVE,
        label: `Active (${activeLocale}:${activeRoute})`,
        tags: [ACTIVE_TAG],
      },
    ]

    for (const code of locales) {
      const configured = options.configuredLocales.find((locale) => locale.code === code)
      const routes = collectRouteNamesForLocale(options.storage, code)

      nodes.push({
        id: `${PREFIX_LOCALE}${code}`,
        label: configured?.displayName ? `${code} (${configured.displayName})` : code,
        tags: code === activeLocale ? [{ ...ACTIVE_TAG, tooltip: 'Active locale' }] : undefined,
      })

      // Flat chunk nodes (not nested): Vue DevTools selection is unreliable for nested
      // custom-inspector children, so route chunks sit at the root next to their locale.
      for (const routeName of routes) {
        nodes.push({
          id: `${PREFIX_CHUNK}${code}|${routeName}`,
          label: `${code}:${routeName}`,
          tags: activeChunkTag(code, routeName, activeLocale, activeRoute),
        })
      }
    }

    return nodes
  }

  if (parsed.kind === 'active') {
    return flattenTranslationNode(options.activeTranslations ?? {}).map((node) => withKeyPrefix(activeLocale, activeRoute, node))
  }

  if (parsed.kind === 'locale' && parsed.locale) {
    const locale = parsed.locale
    return collectRouteNamesForLocale(options.storage, locale).map((routeName) => ({
      id: `${PREFIX_CHUNK}${locale}|${routeName}`,
      label: routeName,
      children: [],
      tags: activeChunkTag(locale, routeName, activeLocale, activeRoute),
    }))
  }

  if (parsed.kind === 'chunk' && parsed.locale) {
    const locale = parsed.locale
    const routeName = parsed.routeName || 'index'
    const chunk = options.storage.translations.get(`${locale}:${routeName}`) as Record<string, unknown> | undefined
    return flattenTranslationNode(chunk ?? {}).map((node) => withKeyPrefix(locale, routeName, node))
  }

  if (parsed.kind === 'key' && parsed.locale) {
    const locale = parsed.locale
    const routeName = parsed.routeName || 'index'
    const chunk = options.storage.translations.get(`${locale}:${routeName}`) as Record<string, unknown> | undefined
    const segments = parsed.segments ?? []
    const isActiveContext = activeLocale === locale && activeRoute === routeName
    const source = isActiveContext ? (options.activeTranslations ?? chunk ?? {}) : (chunk ?? {})

    return flattenTranslationNode(source, segments).map((node) => withKeyPrefix(locale, routeName, node))
  }

  return []
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
    Locales: snapshot.locales.map((locale) => ({
      key: locale.code,
      value: locale.displayName ?? locale.code,
      editable: false,
    })),
  }
}

export function countTranslationKeys(translations: Translations | Record<string, unknown> | undefined): number {
  if (!translations || typeof translations !== 'object') return 0

  const paths = new Set<string>()
  const walk = (obj: Record<string, unknown>, prefix = '') => {
    for (const key of Object.keys(obj)) {
      if (key === '__proto__') continue
      const path = prefix ? `${prefix}.${key}` : key
      paths.add(path)
      const value = obj[key]
      if (isPlainObject(value)) walk(value, path)
    }
  }

  walk(translations as Record<string, unknown>)
  return paths.size
}
