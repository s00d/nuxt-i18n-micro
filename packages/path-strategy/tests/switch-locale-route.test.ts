import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import {
  createPathStrategy,
  NoPrefixPathStrategy,
  PrefixPathStrategy,
  PrefixAndDefaultPathStrategy,
} from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
    { code: 'ru', iso: 'ru-RU' },
  ],
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: false,
}

function makeCtx(strategy: NonNullable<ModuleOptionsExtend['strategy']>, extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, strategy, extra)
}

const route: ResolvedRouteLike = {
  name: 'localized-about-en',
  path: '/en/about',
  fullPath: '/en/about',
  params: { locale: 'en' },
  query: {},
  hash: '',
}

describe('switchLocaleRoute - no_prefix', () => {
  test('returns route with localized name when router has it', () => {
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de'])
    const strategy = new NoPrefixPathStrategy(makeCtx('no_prefix', { router }))
    const result = strategy.switchLocaleRoute('en', 'de', route, { i18nRouteParams: { de: { locale: 'de' } } })
    expect(typeof result).toBe('object')
    expect((result as RouteLike).name).toBe('localized-about-de')
    expect(result).toMatchSnapshot()
  })

  test('when router does not have localized name, falls back to base name if present', () => {
    const router = makeRouterAdapter(['about', 'localized-about-de'])
    const strategy = new NoPrefixPathStrategy(makeCtx('no_prefix', { router }))
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(typeof result).toBe('object')
    expect((result as RouteLike).name).toBe('localized-about-de')
    expect(result).toMatchSnapshot()
  })
})

describe('switchLocaleRoute - prefix', () => {
  test('returns route with localized-{base}-{locale} when router has it', () => {
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de'])
    const strategy = new PrefixPathStrategy(makeCtx('prefix', { router }))
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(typeof result).toBe('object')
    expect((result as RouteLike).name).toBe('localized-about-de')
    expect(result).toMatchSnapshot()
  })

  test('when router does not have target name, returns object with target name (fallback)', () => {
    const router = makeRouterAdapter([])
    const strategy = new PrefixPathStrategy(makeCtx('prefix', { router }))
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(result).toMatchSnapshot()
  })
})

describe('switchLocaleRoute - prefix_and_default', () => {
  test('returns route with localized-{base}-{locale}', () => {
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de', 'localized-about-ru'])
    const strategy = new PrefixAndDefaultPathStrategy(makeCtx('prefix_and_default', { router }))
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(typeof result).toBe('object')
    expect((result as RouteLike).name).toBe('localized-about-de')
    expect(result).toMatchSnapshot()
  })

  test('when router does not have target name, returns object with target name', () => {
    const router = makeRouterAdapter([])
    const strategy = new PrefixAndDefaultPathStrategy(makeCtx('prefix_and_default', { router }))
    const result = strategy.switchLocaleRoute('en', 'de', route, {})
    expect(result).toMatchSnapshot()
  })
})

describe('switchLocaleRoute - via createPathStrategy', () => {
  test('no_prefix', () => {
    const router = makeRouterAdapter(['localized-about-de'])
    const strategy = createPathStrategy(makeCtx('no_prefix', { router }))
    expect(strategy.switchLocaleRoute('en', 'de', route, {})).toMatchSnapshot()
  })

  test('prefix', () => {
    const router = makeRouterAdapter(['localized-about-de'])
    const strategy = createPathStrategy(makeCtx('prefix', { router }))
    expect(strategy.switchLocaleRoute('en', 'de', route, {})).toMatchSnapshot()
  })

  test('prefix_except_default', () => {
    const router = makeRouterAdapter(['localized-about-de'])
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    expect(strategy.switchLocaleRoute('en', 'de', route, {})).toMatchSnapshot()
  })

  test('prefix_and_default', () => {
    const router = makeRouterAdapter(['localized-about-de'])
    const strategy = createPathStrategy(makeCtx('prefix_and_default', { router }))
    expect(strategy.switchLocaleRoute('en', 'de', route, {})).toMatchSnapshot()
  })
})

describe('snapshots (documentation: how switchLocaleRoute works)', () => {
  test('switchLocaleRoute: result per strategy en→de', () => {
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de'])
    const strategies = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default'] as const
    const out: Record<string, RouteLike | string> = {}
    for (const s of strategies) {
      const strategy = createPathStrategy(makeCtx(s, { router }))
      out[s] = strategy.switchLocaleRoute('en', 'de', route, {})
    }
    expect(out).toMatchSnapshot()
  })

  test('switchLocaleRoute with i18nRouteParams: full result object', () => {
    const router = makeRouterAdapter(['localized-about-en', 'localized-about-de'])
    const strategy = createPathStrategy(makeCtx('prefix_except_default', { router }))
    const result = strategy.switchLocaleRoute('en', 'de', route, {
      i18nRouteParams: { de: { locale: 'de', tab: 'info' } },
    })
    expect(typeof result).toBe('object')
    expect((result as RouteLike).name).toBe('localized-about-de')
    expect((result as { params?: Record<string, string> }).params?.tab).toBe('info')
    expect(result).toMatchSnapshot()
  })
})
