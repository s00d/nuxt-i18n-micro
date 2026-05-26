import type { PathStrategyContext } from '../../src/types'

export const localeCodes = ['en', 'zh'] as const
export const locales = localeCodes.map((code) => ({ code }))

export const stubRouter: PathStrategyContext['router'] = {
  hasRoute: () => false,
  resolve: (to) => {
    if (typeof to === 'string') {
      return { name: null, path: to, fullPath: to, params: {}, query: {}, hash: '' }
    }

    const path = to.path ?? '/'
    return {
      name: to.name ?? null,
      path,
      fullPath: to.fullPath ?? path,
      params: to.params ?? {},
      query: to.query ?? {},
      hash: to.hash ?? '',
    }
  },
}

export function baseContext(overrides: Partial<PathStrategyContext> = {}): PathStrategyContext {
  return {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales,
    localeCodes: [...localeCodes],
    localizedRouteNamePrefix: 'localized-',
    router: stubRouter,
    globalLocaleRoutes: {
      pricing: false,
    },
    routeLocales: {
      account: ['en'],
    },
    ...overrides,
  }
}
