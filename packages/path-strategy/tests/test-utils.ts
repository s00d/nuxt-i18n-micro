import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, RouteLike, RouterAdapter } from '../src'

export interface MakeRouterAdapterOptions {
  /** If true, resolve() throws when route name is not in existingNames. Used to trigger buildPathFromBaseNameAndParams fallback. */
  throwOnUnknownName?: boolean
  /** Optional: build path from name (e.g. 'products-id' + params { id: '1' } -> '/products/1'). */
  pathFromName?: (name: string, params: Record<string, unknown>) => string | null
}

/** Route names (paths unknown) or a `{ name: '/path/:param' }` table, as vue-router route records. */
export type RouteTable = string[] | Record<string, string>

// `:name`, `:name(regex)`, `:name()` / `:name?` (optional), `:name(.*)*` (catch-all)
const PARAM = /:(\w+)(\([^)]*\))?([?*+])?/g

function fillTemplate(template: string, name: string, params: Record<string, unknown>): string {
  const path = template.replace(PARAM, (_m, key: string, regex: string | undefined, modifier: string | undefined) => {
    const value = params[key]
    const optional = modifier === '?' || modifier === '*' || regex === '()'
    if (value === undefined || value === null || value === '') {
      if (optional) return ''
      throw new Error(`Missing required param "${key}" for route "${name}"`)
    }
    return Array.isArray(value) ? value.join('/') : String(value)
  })
  return path.replace(/\/{2,}/g, '/').replace(/(.)\/$/, '$1') || '/'
}

function matchTemplate(template: string, path: string): Record<string, string> | null {
  const keys: string[] = []
  let source = ''
  let last = 0
  for (const m of template.matchAll(PARAM)) {
    source += template.slice(last, m.index).replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    keys.push(m[1]!)
    const re = m[2] && m[2] !== '()' ? m[2].slice(1, -1) : '[^/]+'
    source += m[3] === '*' || m[3] === '?' || m[2] === '()' ? `(${re})?` : `(${re})`
    last = m.index! + m[0].length
  }
  source += template.slice(last).replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`^${source.replace(/\/\(/g, '/?(')}/?$`).exec(path)
  if (!match) return null
  const params: Record<string, string> = {}
  keys.forEach((k, i) => {
    if (match[i + 1] !== undefined) params[k] = match[i + 1]!
  })
  return params
}

/** Per-segment specificity, vue-router style: static > param with regex > param > optional / catch-all. */
function rankTemplate(template: string): number[] {
  return template
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (!segment.includes(':')) return 4
      if (/[?*]$|\(\)/.test(segment)) return 1
      return /\([^)]+\)/.test(segment) ? 3 : 2
    })
}

function compareRank(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i]! - b[i]!
  return a.length - b.length
}

/**
 * Router double that behaves like vue-router for the parts strategies use:
 * - `resolve({ name, params })` fills the route's path template and throws on a missing
 *   required param; a name without a known path throws instead of answering `/`.
 * - `resolve('/path')` / `resolve({ path })` matches the templates and returns name + params.
 * Names passed as a plain array have no path: give `{ path }` explicitly, `pathFromName`,
 * or use the `{ name: path }` table form.
 */
export const makeRouterAdapter = (routes: RouteTable = [], options: MakeRouterAdapterOptions = {}): RouterAdapter => {
  const { throwOnUnknownName = false, pathFromName } = options
  const table: Record<string, string | null> = Array.isArray(routes) ? Object.fromEntries(routes.map((n) => [n, null])) : { ...routes }
  const names = Object.keys(table)

  const byPath = (path: string, route?: RouteLike) => {
    // Like vue-router, the most specific matching record wins, not the first declared.
    let best: { name: string; params: Record<string, string>; rank: number[] } | null = null
    for (const name of names) {
      const template = table[name]
      const params = template ? matchTemplate(template, path) : null
      if (!params) continue
      const rank = rankTemplate(template!)
      if (!best || compareRank(rank, best.rank) > 0) best = { name, params, rank }
    }
    if (best)
      return { name: best.name, path, fullPath: route?.fullPath ?? path, params: best.params, query: route?.query ?? {}, hash: route?.hash ?? '' }
    return { name: null, path, fullPath: route?.fullPath ?? path, params: route?.params ?? {}, query: route?.query ?? {}, hash: route?.hash ?? '' }
  }

  return {
    hasRoute: (name: string) => name in table,
    resolve: (to: RouteLike | string) => {
      if (typeof to === 'string') return byPath(to)
      const route = to as RouteLike
      const name = route.name?.toString() ?? null
      if (!name) return byPath(route.path ?? route.fullPath ?? '/', route)
      if (!(name in table)) {
        if (throwOnUnknownName) throw new Error(`Unknown route name: ${name}`)
        return {
          name,
          path: route.path ?? '/',
          fullPath: route.fullPath ?? route.path ?? '/',
          params: route.params ?? {},
          query: route.query ?? {},
          hash: route.hash ?? '',
        }
      }
      const params = (route.params ?? {}) as Record<string, unknown>
      const template = table[name]
      let path: string | null = template ? fillTemplate(template, name, params) : (route.path ?? null)
      if (path === null && pathFromName) path = pathFromName(name, params)
      if (path === null) {
        if (route.fullPath) path = route.fullPath
        else throw new Error(`makeRouterAdapter: no path registered for route "${name}" — use the { name: path } table form`)
      }
      return { name, path, fullPath: route.fullPath ?? path, params, query: route.query ?? {}, hash: route.hash ?? '' }
    },
  }
}

export const makePathStrategyContext = (
  baseConfig: ModuleOptionsExtend,
  strategy: NonNullable<ModuleOptionsExtend['strategy']>,
  extra?: Partial<PathStrategyContext>,
): PathStrategyContext => {
  const locales = baseConfig.locales!
  return {
    strategy,
    defaultLocale: baseConfig.defaultLocale!,
    locales,
    localeCodes: locales.map((l) => l.code),
    localizedRouteNamePrefix: baseConfig.localizedRouteNamePrefix || 'localized-',
    router: makeRouterAdapter(),
    ...extra,
  }
}
