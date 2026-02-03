import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import {
  PrefixPathStrategy,
  PrefixExceptDefaultPathStrategy,
  PrefixAndDefaultPathStrategy,
  NoPrefixPathStrategy,
} from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
  ],
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: false,
}

const route: ResolvedRouteLike = {
  name: 'localized-about-en',
  path: '/en/about',
  fullPath: '/en/about',
  params: {},
  query: {},
  hash: '',
}

describe('RouterAdapter fallback: hasRoute returns false', () => {
  test('PrefixPathStrategy.switchLocaleRoute returns object with target name when router has no routes', () => {
    const router = makeRouterAdapter([])
    const ctx: PathStrategyContext = makePathStrategyContext(baseConfig, 'prefix', { router })
    const strategy = new PrefixPathStrategy(ctx)
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(typeof result).toBe('object')
    const obj = result as RouteLike
    expect(obj.name).toBe('localized-about-de')
    // Fallback spreads source route, so path may still be present
  })

  test('PrefixExceptDefaultPathStrategy.switchLocaleRoute returns object with target name when router has no target', () => {
    const router = makeRouterAdapter([])
    const ctx = makePathStrategyContext(baseConfig, 'prefix_except_default', { router })
    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(typeof result).toBe('object')
    expect((result as RouteLike).name).toBe('localized-about-de')
  })

  test('PrefixAndDefaultPathStrategy.switchLocaleRoute returns object with target name when router has no routes', () => {
    const router = makeRouterAdapter([])
    const ctx = makePathStrategyContext(baseConfig, 'prefix_and_default', { router })
    const strategy = new PrefixAndDefaultPathStrategy(ctx)
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect((result as RouteLike).name).toBe('localized-about-de')
  })

  test('NoPrefixPathStrategy.switchLocaleRoute returns unchanged route when router has neither target nor base', () => {
    const router = makeRouterAdapter([])
    const ctx = makePathStrategyContext(baseConfig, 'no_prefix', { router })
    const strategy = new NoPrefixPathStrategy(ctx)
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(result).toBe(route)
  })
})

describe('RouterAdapter: resolve used for localeRoute with object', () => {
  test('localeRoute with object: resolve is called with route', () => {
    const resolveSpy = jest.fn((to: RouteLike | string) => {
      if (typeof to === 'string') return { name: to, path: to, fullPath: to, params: {}, query: {}, hash: '' }
      const r = to as RouteLike
      return {
        name: r.name ?? null,
        path: r.path ?? '/',
        fullPath: r.fullPath ?? r.path ?? '/',
        params: r.params ?? {},
        query: r.query ?? {},
        hash: r.hash ?? '',
      }
    })
    const adapter = {
      hasRoute: (name: string) => ['localized-about-de'].includes(name),
      resolve: resolveSpy,
    }
    const ctx = makePathStrategyContext(baseConfig, 'prefix_except_default', { router: adapter })
    const strategy = new PrefixExceptDefaultPathStrategy(ctx)
    strategy.localeRoute('de', { name: 'localized-about-en', path: '/about' }, route)
    expect(resolveSpy).toHaveBeenCalled()
  })
})
