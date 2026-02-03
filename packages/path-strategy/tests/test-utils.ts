import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, RouteLike, RouterAdapter } from '../src'

export interface MakeRouterAdapterOptions {
  /** If true, resolve() throws when route name is not in existingNames. Used to trigger buildPathFromBaseNameAndParams fallback. */
  throwOnUnknownName?: boolean
  /** Optional: build path from name (e.g. 'products-id' + params { id: '1' } -> '/products/1'). */
  pathFromName?: (name: string, params: Record<string, unknown>) => string | null
}

export const makeRouterAdapter = (
  existingNames: string[] = [],
  options: MakeRouterAdapterOptions = {},
): RouterAdapter => {
  const { throwOnUnknownName = false, pathFromName } = options
  return {
    hasRoute: (name: string) => existingNames.includes(name),
    resolve: (to: RouteLike | string) => {
      if (typeof to === 'string') {
        if (throwOnUnknownName && !existingNames.includes(to)) {
          throw new Error(`Unknown route name: ${to}`)
        }
        return { name: to, path: to, fullPath: to, params: {}, query: {}, hash: '' }
      }
      const route = to as RouteLike
      const name = route.name?.toString() ?? null
      if (throwOnUnknownName && name && !existingNames.includes(name)) {
        throw new Error(`Unknown route name: ${name}`)
      }
      let path = route.path ?? '/'
      let fullPath = route.fullPath ?? route.path ?? '/'
      if (pathFromName && name && (path === '/' || !path) && route.params) {
        const built = pathFromName(name, route.params)
        if (built) {
          path = built
          fullPath = built
        }
      }
      return {
        name,
        path,
        fullPath,
        params: route.params ?? {},
        query: route.query ?? {},
        hash: route.hash ?? '',
      }
    },
  }
}

export const makePathStrategyContext = (
  baseConfig: ModuleOptionsExtend,
  strategy: NonNullable<ModuleOptionsExtend['strategy']>,
  extra?: Partial<PathStrategyContext>,
): PathStrategyContext => ({
  strategy,
  defaultLocale: baseConfig.defaultLocale!,
  locales: baseConfig.locales!,
  localizedRouteNamePrefix: baseConfig.localizedRouteNamePrefix || 'localized-',
  router: makeRouterAdapter(),
  ...extra,
})
