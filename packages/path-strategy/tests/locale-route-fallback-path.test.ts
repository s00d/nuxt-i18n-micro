/**
 * Tests: fallback path from name key (transformNameKeyToPath) and from router.resolve(baseName, params).
 * Ensures activity-skiing -> /locale/activity/skiing and test-id with params -> /locale/test-my-id.
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike, RouterAdapter } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix',
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

type StrategyName = 'prefix' | 'prefix_except_default' | 'prefix_and_default' | 'no_prefix'

function makeCtx(strategy: StrategyName, extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, strategy, extra)
}

const currentRoute: ResolvedRouteLike = {
  name: 'localized-activity-en',
  path: '/en/activity',
  fullPath: '/en/activity',
  params: {},
  query: {},
  hash: '',
}

const fallbackRouterNoRoute: RouterAdapter = {
  hasRoute: () => false,
  resolve: (to: RouteLike | string) => {
    if (typeof to === 'string') return { name: null, path: to, fullPath: to, params: {}, query: {}, hash: '' }
    const r = to as RouteLike
    return { name: r.name ?? null, path: r.path ?? '/', fullPath: r.fullPath ?? r.path ?? '/', params: r.params ?? {}, query: r.query ?? {}, hash: r.hash ?? '' }
  },
}

function runFallbackNameKeyTests(strategy: StrategyName, _enPrefix: string, _dePrefix: string) {
  test('router does not have localized name: strategy returns object with fullPath from transformNameKeyToPath', () => {
    const s = createPathStrategy(makeCtx(strategy, { router: fallbackRouterNoRoute }))
    const result = s.localeRoute('en', { name: 'activity-skiing' }, currentRoute)
    expect(result.path).toContain('/activity/skiing')
    expect(result).toMatchSnapshot()
  })

  test('same for de locale', () => {
    const s = createPathStrategy(makeCtx(strategy, { router: fallbackRouterNoRoute }))
    const result = s.localeRoute('de', { name: 'activity-skiing' }, currentRoute)
    expect(result.path).toContain('/activity/skiing')
    expect(result).toMatchSnapshot()
  })

  test('activity-hiking -> path form', () => {
    const s = createPathStrategy(makeCtx(strategy, { router: fallbackRouterNoRoute }))
    const result = s.localeRoute('en', { name: 'activity-hiking' }, currentRoute)
    expect(result.path).toContain('/activity/hiking')
    expect(result).toMatchSnapshot()
  })
}

function runFallbackParamsTests(
  strategy: StrategyName,
  enPrefix: string,
  dePrefix: string,
  opts?: { skipNoRouteFallback?: boolean },
) {
  const routerWithTestId: RouterAdapter = {
    hasRoute: (name: string) => name === 'test-id',
    resolve: (to: RouteLike | string) => {
      if (typeof to === 'string') return { name: null, path: to, fullPath: to, params: {}, query: {}, hash: '' }
      const r = to as RouteLike
      const params = r.params ?? {}
      const id = params.id as string | undefined
      const path = id ? `/test/${id}` : '/test/id'
      return { name: r.name ?? null, path, fullPath: path, params: r.params ?? {}, query: r.query ?? {}, hash: r.hash ?? '' }
    },
  }

  test('router has baseName and resolve(baseName, params) returns path with params: strategy returns fullPath with params', () => {
    const s = createPathStrategy(makeCtx(strategy, { router: routerWithTestId }))
    const result = s.localeRoute('en', { name: 'test-id', params: { id: 'my-id' } }, currentRoute)
    expect(result.path).toContain('/test/my-id')
    expect(result).toMatchSnapshot()
  })

  test('same for de locale with params', () => {
    const s = createPathStrategy(makeCtx(strategy, { router: routerWithTestId }))
    const result = s.localeRoute('de', { name: 'test-id', params: { id: 'my-id' } }, currentRoute)
    expect(result.path).toContain('/test/my-id')
    expect(result).toMatchSnapshot()
  })

  if (!opts?.skipNoRouteFallback) {
    test('router does not have baseName: with params strategy builds path from baseName+params (hyphen form for test-id+id)', () => {
      const routerNoRoute: RouterAdapter = {
        hasRoute: () => false,
        resolve: () => { throw new Error('no route') },
      }
      const s = createPathStrategy(makeCtx(strategy, { router: routerNoRoute }))
      const result = s.localeRoute('en', { name: 'test-id', params: { id: 'my-id' } }, currentRoute)
      expect(result).toMatchSnapshot()
    })
  }
}

describe('localeRoute fallback: name key -> path form (activity-skiing -> activity/skiing)', () => {
  describe('prefix', () => {
    runFallbackNameKeyTests('prefix', '/en', '/de')
  })

  describe('prefix_except_default', () => {
    runFallbackNameKeyTests('prefix_except_default', '', '/de')
  })

  describe('prefix_and_default', () => {
    runFallbackNameKeyTests('prefix_and_default', '/en', '/de')
  })

  describe('no_prefix', () => {
    runFallbackNameKeyTests('no_prefix', '', '')
  })
})

describe('localeRoute fallback: name with params -> fullPath with params substituted', () => {
  describe('prefix', () => {
    runFallbackParamsTests('prefix', '/en', '/de')
  })

  describe('prefix_except_default', () => {
    runFallbackParamsTests('prefix_except_default', '', '/de', { skipNoRouteFallback: true })
  })

  describe('prefix_and_default', () => {
    runFallbackParamsTests('prefix_and_default', '/en', '/de', { skipNoRouteFallback: true })
  })

  describe('no_prefix', () => {
    runFallbackParamsTests('no_prefix', '', '')
  })
})
