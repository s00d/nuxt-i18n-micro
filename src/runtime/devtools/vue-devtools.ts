import {
  buildInspectorState,
  buildInspectorTree,
  countTranslationKeys,
  getByInspectorPath,
  parseInspectorNodeId,
  type I18nDevtoolsStateSnapshot,
} from '@i18n-micro/core/devtools'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { App } from 'vue'
import type { I18nContextChangeReason, NuxtI18n } from '../utils/nuxt-i18n'

const INSPECTOR_ID = 'i18n-micro-inspector'
const PLUGIN_ID = 'nuxt-i18n-micro'
const TIMELINE_LAYER_ID = 'i18n-micro'

export interface VueI18nDevtoolsContext {
  app: App
  i18n: NuxtI18n
  i18nConfig: ModuleOptionsExtend
  onContextChange: (listener: (reason: I18nContextChangeReason) => void) => () => void
  onMissingKey: (listener: (locale: string, key: string, routeName: string) => void) => () => void
}

export interface VueI18nDevtoolsNotifier {
  notifyLocaleSwitch: (from: string, to: string, routeName: string) => void
  notifyLoad: (locale: string, routeName: string, keyCount: number) => void
  notifyTranslate: (key: string, result: unknown) => void
  refreshInspector: () => void
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

function toInspectorState(snapshot: I18nDevtoolsStateSnapshot) {
  const groups = buildInspectorState(snapshot)
  const state: Record<string, Array<{ key: string; value: unknown }>> = {}

  for (const [group, entries] of Object.entries(groups)) {
    state[group] = entries.map((entry) => ({
      key: entry.key,
      value: entry.value,
    }))
  }

  return state
}

function createSnapshot(i18n: NuxtI18n, i18nConfig: ModuleOptionsExtend): I18nDevtoolsStateSnapshot {
  return {
    locale: i18n.getCurrentLocale(),
    routeName: i18n.getCurrentRouteName() || 'index',
    strategy: i18nConfig.strategy,
    defaultLocale: i18nConfig.defaultLocale,
    fallbackLocale: i18nConfig.fallbackLocale,
    cachedChunks: i18n.storage.translations.size,
    locales: (i18nConfig.locales ?? []).map((locale) => ({
      code: locale.code,
      displayName: locale.displayName,
      disabled: locale.disabled,
    })),
  }
}

function buildNodeState(i18n: NuxtI18n, i18nConfig: ModuleOptionsExtend, nodeId: string): Record<string, Array<{ key: string; value: unknown }>> {
  const parsed = parseInspectorNodeId(nodeId)

  if (parsed.kind === 'active') {
    return {
      Translations: objectToStateEntries(i18n.resolveTranslations() as Record<string, unknown>),
    }
  }

  if (parsed.kind === 'locale' && parsed.locale) {
    const locale = parsed.locale
    const configured = (i18nConfig.locales ?? []).find((item) => item.code === locale)
    const prefix = `${locale}:`
    const chunks: Array<{ key: string; value: unknown }> = []

    for (const [cacheKey, data] of i18n.storage.translations) {
      if (!cacheKey.startsWith(prefix)) continue
      const routeName = cacheKey.slice(prefix.length) || 'index'
      chunks.push({
        key: routeName,
        value: `${countTranslationKeys(data)} keys`,
      })
    }

    chunks.sort((a, b) => a.key.localeCompare(b.key))

    return {
      Locale: [
        { key: 'code', value: locale },
        { key: 'displayName', value: configured?.displayName ?? locale },
        { key: 'disabled', value: Boolean(configured?.disabled) },
        { key: 'isActive', value: i18n.getCurrentLocale() === locale },
        { key: 'loadedChunks', value: chunks.length },
      ],
      Chunks: chunks.length ? chunks : [{ key: '—', value: 'No translation chunks loaded for this locale yet' }],
    }
  }

  if (parsed.kind === 'chunk' && parsed.locale) {
    const routeName = parsed.routeName || 'index'
    const cacheKey = `${parsed.locale}:${routeName}`
    const chunk = i18n.storage.translations.get(cacheKey) as Record<string, unknown> | undefined

    if (!chunk) {
      return {
        Chunk: [
          { key: 'cacheKey', value: cacheKey },
          { key: 'status', value: 'not loaded' },
        ],
      }
    }

    const entries = objectToStateEntries(chunk)
    return {
      Chunk: [
        { key: 'cacheKey', value: cacheKey },
        { key: 'keys', value: countTranslationKeys(chunk) },
        {
          key: 'isActive',
          value: i18n.getCurrentLocale() === parsed.locale && (i18n.getCurrentRouteName() || 'index') === routeName,
        },
      ],
      Translations: entries.length ? entries : [{ key: '—', value: 'Chunk is loaded but empty' }],
    }
  }

  if (parsed.kind === 'key' && parsed.locale) {
    const routeName = parsed.routeName || 'index'
    const segments = parsed.segments ?? []
    const chunk = i18n.storage.translations.get(`${parsed.locale}:${routeName}`) as Record<string, unknown> | undefined
    const isActive = i18n.getCurrentLocale() === parsed.locale && (i18n.getCurrentRouteName() || 'index') === routeName
    const source = isActive ? (i18n.resolveTranslations() as Record<string, unknown>) : (chunk ?? {})
    const value = segments.length ? getByInspectorPath(source, segments) : source

    if (isPlainObject(value)) {
      return { [(segments.join('.') || 'root')]: objectToStateEntries(value) }
    }

    return {
      Value: [{ key: segments.join('.') || 'value', value }],
    }
  }

  return toInspectorState(createSnapshot(i18n, i18nConfig))
}

function objectToStateEntries(obj: Record<string, unknown>, limit = 500): Array<{ key: string; value: unknown }> {
  const entries: Array<{ key: string; value: unknown }> = []
  let truncated = false

  // Breadth-first so shallow keys (navigation, test_key, …) aren't starved by deep
  // playground nests like key0.key0.key0… before the leaf cap hits.
  const queue: Array<{ node: Record<string, unknown>; prefix: string }> = [{ node: obj, prefix: '' }]

  while (queue.length > 0) {
    const { node, prefix } = queue.shift()!
    const nested: Array<{ node: Record<string, unknown>; prefix: string }> = []

    for (const key of Object.keys(node)) {
      if (key === '__proto__') continue
      if (entries.length >= limit) {
        truncated = true
        break
      }

      const path = prefix ? `${prefix}.${key}` : key
      const value = node[key]

      if (isPlainObject(value)) {
        nested.push({ node: value, prefix: path })
        continue
      }

      entries.push({ key: path, value })
    }

    if (truncated) break
    queue.push(...nested)
  }

  entries.sort((a, b) => a.key.localeCompare(b.key))

  if (truncated) {
    entries.push({
      key: '…',
      value: `Showing first ${limit} leaves (nested keys flattened)`,
    })
  }

  return entries
}

export async function setupVueI18nDevtools(ctx: VueI18nDevtoolsContext): Promise<VueI18nDevtoolsNotifier | null> {
  if (!import.meta.dev || import.meta.server) {
    return null
  }

  let notifier: VueI18nDevtoolsNotifier | null = null

  try {
    const { setupDevtoolsPlugin } = await import('@vue/devtools-api')

    setupDevtoolsPlugin(
      {
        id: PLUGIN_ID,
        label: 'i18n Micro',
        packageName: 'nuxt-i18n-micro',
        homepage: 'https://s00d.github.io/nuxt-i18n-micro/',
        logo: 'https://s00d.github.io/nuxt-i18n-micro/favicon.svg',
        app: ctx.app,
        enableEarlyProxy: true,
      },
      (api) => {
        const refreshInspector = () => {
          api.sendInspectorTree(INSPECTOR_ID)
          api.sendInspectorState(INSPECTOR_ID)
        }

        api.addInspector({
          id: INSPECTOR_ID,
          label: 'i18n Micro',
          icon: 'carbon:language',
          actions: [
            {
              icon: 'refresh',
              tooltip: 'Refresh inspector',
              action: refreshInspector,
            },
          ],
        })

        api.addTimelineLayer({
          id: TIMELINE_LAYER_ID,
          label: 'i18n Micro',
          color: 0x42b883,
        })

        api.on.getInspectorTree((payload) => {
          if (payload.inspectorId !== INSPECTOR_ID) return

          payload.rootNodes = buildInspectorTree({
            nodeId: 'root',
            storage: ctx.i18n.storage,
            configuredLocales: ctx.i18nConfig.locales ?? [],
            activeLocale: ctx.i18n.getCurrentLocale(),
            activeRouteName: ctx.i18n.getCurrentRouteName() || 'index',
            activeTranslations: ctx.i18n.resolveTranslations() as Record<string, unknown>,
          }) as never
        })

        api.on.getInspectorState((payload) => {
          if (payload.inspectorId !== INSPECTOR_ID) return

          payload.state = (
            payload.nodeId ? buildNodeState(ctx.i18n, ctx.i18nConfig, payload.nodeId) : toInspectorState(createSnapshot(ctx.i18n, ctx.i18nConfig))
          ) as never
        })

        ctx.onContextChange(() => {
          refreshInspector()
        })
        ctx.onMissingKey((locale, key, routeName) => {
          api.addTimelineEvent({
            layerId: TIMELINE_LAYER_ID,
            event: {
              time: api.now(),
              title: 'Missing translation',
              subtitle: key,
              data: { locale, key, routeName },
            },
          })
        })

        notifier = {
          notifyLocaleSwitch(from, to, routeName) {
            api.addTimelineEvent({
              layerId: TIMELINE_LAYER_ID,
              event: {
                time: api.now(),
                title: 'Locale switch',
                subtitle: `${from || '—'} → ${to}`,
                data: { from, to, routeName },
              },
            })
            refreshInspector()
          },
          notifyLoad(locale, routeName, keyCount) {
            api.addTimelineEvent({
              layerId: TIMELINE_LAYER_ID,
              event: {
                time: api.now(),
                title: 'Translations loaded',
                subtitle: `${locale}:${routeName}`,
                data: { locale, routeName, keyCount },
              },
            })
            refreshInspector()
          },
          notifyTranslate(key, result) {
            api.addTimelineEvent({
              layerId: TIMELINE_LAYER_ID,
              event: {
                time: api.now(),
                title: '$t',
                subtitle: key,
                data: { key, result },
              },
            })
          },
          refreshInspector,
        }

        refreshInspector()
      },
    )
  } catch {
    return null
  }

  return notifier
}

export function countLoadedTranslationKeys(i18n: NuxtI18n, locale: string, routeName: string): number {
  const chunk = i18n.storage.translations.get(i18n.getCacheKey(locale, routeName))
  return countTranslationKeys(chunk)
}
