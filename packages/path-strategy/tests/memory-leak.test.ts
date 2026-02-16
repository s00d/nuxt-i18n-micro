/**
 * Memory leak and mutation safety tests for path-strategy.
 *
 * Tests:
 * 1. Heap doesn't grow linearly over many iterations (no leak)
 * 2. Input objects are not unexpectedly mutated
 * 3. Strategy lifecycle: create/destroy doesn't leak
 * 4. Router replacement via setRouter doesn't leak
 */

import { createPathStrategy } from '../src'
import { preserveQueryAndHash } from '../src/helpers'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike, RouterAdapter } from '../src/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LOCALES = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'fr', iso: 'fr-FR' },
  { code: 'es', iso: 'es-ES' },
  { code: 'it', iso: 'it-IT' },
]

function makeRouter(routes: { name: string; path: string }[] = []): RouterAdapter {
  const map = new Map(routes.map((r) => [r.name, r]))
  return {
    hasRoute: (name: string) => map.has(name),
    resolve: (to: RouteLike | string) => {
      const name = typeof to === 'string' ? to : (to?.name?.toString() ?? null)
      const route = name ? map.get(name) : null
      return {
        name: route?.name ?? name ?? null,
        path: route?.path ?? (typeof to === 'object' ? (to?.path ?? '/') : '/'),
        fullPath: route?.path ?? '/',
        params: typeof to === 'object' ? (to?.params ?? {}) : {},
        query: typeof to === 'object' ? (to?.query ?? {}) : {},
        hash: typeof to === 'object' ? (to?.hash ?? '') : '',
      }
    },
  }
}

function makeCtx(strategy: PathStrategyContext['strategy'], extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return {
    strategy,
    defaultLocale: 'en',
    locales: LOCALES,
    localeCodes: LOCALES.map((l) => l.code),
    localizedRouteNamePrefix: 'localized-',
    router: makeRouter([
      { name: 'index', path: '/' },
      { name: 'about', path: '/about' },
      { name: 'contact', path: '/contact' },
      { name: 'localized-about-de', path: '/de/about' },
      { name: 'localized-about-fr', path: '/fr/about' },
      { name: 'localized-contact-de', path: '/de/contact' },
      { name: 'localized-index-de', path: '/de' },
      { name: 'localized-index-fr', path: '/fr' },
    ]),
    ...extra,
  }
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

const STRATEGIES: PathStrategyContext['strategy'][] = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default']

// ---------------------------------------------------------------------------
// 1. Heap growth test — no leak over many iterations
// ---------------------------------------------------------------------------

describe('Memory: no heap growth over many iterations', () => {
  for (const strategyName of STRATEGIES) {
    test(`${strategyName}: localeRoute x50k — no linear heap growth`, () => {
      const strategy = createPathStrategy(makeCtx(strategyName))
      const current: ResolvedRouteLike = {
        name: 'about',
        path: '/about',
        fullPath: '/about',
        params: {},
        query: {},
        hash: '',
      }

      // Warmup — let V8 optimize
      for (let i = 0; i < 5000; i++) {
        strategy.localeRoute('de', { name: 'about' }, current)
        strategy.localeRoute('en', '/contact', current)
        strategy.switchLocaleRoute('en', 'fr', current, {})
      }

      // Force GC if available
      if (global.gc) global.gc()
      const heapBefore = process.memoryUsage().heapUsed

      const ITERATIONS = 50_000
      for (let i = 0; i < ITERATIONS; i++) {
        strategy.localeRoute('de', { name: 'about' }, current)
        strategy.localeRoute('en', '/contact', current)
        strategy.localeRoute('fr', { name: 'about', params: { id: '1' } }, current)
        strategy.switchLocaleRoute('en', 'de', current, {})
        strategy.getRedirect('/de/about', 'de')
        strategy.shouldReturn404('/de/about')
        strategy.resolveLocaleFromPath('/de/about')
      }

      if (global.gc) global.gc()
      const heapAfter = process.memoryUsage().heapUsed

      const growthMB = (heapAfter - heapBefore) / 1024 / 1024
      // Allow up to 20MB growth (JIT artifacts, test framework overhead, CI load)
      // A real leak at 50K iters with object creation would be >50MB
      expect(growthMB).toBeLessThan(20)
    })
  }
})

// ---------------------------------------------------------------------------
// 2. Mutation safety — input objects must not be modified
// ---------------------------------------------------------------------------

describe('Mutation safety: input objects not modified', () => {
  for (const strategyName of STRATEGIES) {
    test(`${strategyName}: localeRoute does not mutate sourceRoute`, () => {
      const strategy = createPathStrategy(makeCtx(strategyName))
      const current: ResolvedRouteLike = {
        name: 'about',
        path: '/about',
        fullPath: '/about',
        params: {},
        query: { tab: 'info' },
        hash: '#top',
      }

      const sourceRoute: RouteLike = {
        name: 'about',
        path: '/about',
        params: { id: '1' },
        query: { tab: 'info' },
        hash: '#section',
      }
      const sourceClone = deepClone(sourceRoute)

      strategy.localeRoute('de', sourceRoute, current)
      strategy.localeRoute('en', sourceRoute, current)
      strategy.localeRoute('fr', sourceRoute, current)

      // sourceRoute's OWN properties should be unchanged
      expect(sourceRoute.name).toBe(sourceClone.name)
      expect(sourceRoute.path).toBe(sourceClone.path)
      expect(sourceRoute.hash).toBe(sourceClone.hash)
      expect(JSON.stringify(sourceRoute.params)).toBe(JSON.stringify(sourceClone.params))
      expect(JSON.stringify(sourceRoute.query)).toBe(JSON.stringify(sourceClone.query))
    })

    test(`${strategyName}: switchLocaleRoute does not mutate input route`, () => {
      const strategy = createPathStrategy(makeCtx(strategyName))
      const route: ResolvedRouteLike = {
        name: 'localized-about-de',
        path: '/de/about',
        fullPath: '/de/about',
        params: { locale: 'de' },
        query: { q: '1' },
        hash: '#h',
      }
      const clone = deepClone(route)

      strategy.switchLocaleRoute('de', 'en', route, {})
      strategy.switchLocaleRoute('de', 'fr', route, {})

      expect(route.name).toBe(clone.name)
      expect(route.path).toBe(clone.path)
      expect(JSON.stringify(route.params)).toBe(JSON.stringify(clone.params))
      expect(JSON.stringify(route.query)).toBe(JSON.stringify(clone.query))
      expect(route.hash).toBe(clone.hash)
    })

    test(`${strategyName}: currentRoute not mutated`, () => {
      const strategy = createPathStrategy(makeCtx(strategyName))
      const current: ResolvedRouteLike = {
        name: 'about',
        path: '/about',
        fullPath: '/about',
        params: {},
        query: {},
        hash: '',
      }
      const clone = deepClone(current)

      strategy.localeRoute('de', { name: 'about' }, current)
      strategy.localeRoute('fr', '/contact', current)

      expect(current.name).toBe(clone.name)
      expect(current.path).toBe(clone.path)
      expect(current.fullPath).toBe(clone.fullPath)
    })
  }
})

// ---------------------------------------------------------------------------
// 3. preserveQueryAndHash mutation test
// ---------------------------------------------------------------------------

describe('Mutation safety: preserveQueryAndHash', () => {
  test('does not add properties to a string-converted target', () => {
    const result = preserveQueryAndHash('/about', { query: { a: '1' }, hash: '#h' }) as RouteLike
    expect(result.path).toBe('/about')
    expect(result.query).toEqual({ a: '1' })
    expect(result.hash).toBe('#h')
  })

  test('mutates RouteLike target — caller must be aware', () => {
    const target: RouteLike = { path: '/about', fullPath: '/about' }
    const source: RouteLike = { query: { x: '1' }, hash: '#z' }
    const result = preserveQueryAndHash(target, source) as RouteLike

    // preserveQueryAndHash mutates target in-place (by design after optimization)
    expect(result).toBe(target) // same reference
    expect(result.query).toEqual({ x: '1' })
    expect(result.hash).toBe('#z')
  })

  test('does not cross-contaminate between calls', () => {
    const target1: RouteLike = { path: '/a', fullPath: '/a' }
    const target2: RouteLike = { path: '/b', fullPath: '/b' }

    preserveQueryAndHash(target1, { query: { k: '1' } })
    preserveQueryAndHash(target2, { query: { k: '2' } })

    expect((target1.query as any)?.k).toBe('1')
    expect((target2.query as any)?.k).toBe('2')
  })
})

// ---------------------------------------------------------------------------
// 4. Strategy lifecycle: create/destroy
// ---------------------------------------------------------------------------

describe('Memory: strategy lifecycle', () => {
  test('creating many strategies does not leak (no static state)', () => {
    if (global.gc) global.gc()
    const heapBefore = process.memoryUsage().heapUsed

    for (let i = 0; i < 10_000; i++) {
      const ctx = makeCtx('prefix_except_default')
      const strategy = createPathStrategy(ctx)
      strategy.localeRoute('de', { name: 'about' })
      // strategy and ctx go out of scope here
    }

    if (global.gc) global.gc()
    const heapAfter = process.memoryUsage().heapUsed

    const growthMB = (heapAfter - heapBefore) / 1024 / 1024
    expect(growthMB).toBeLessThan(10)
  })

  test('setRouter replaces old router cleanly', () => {
    const ctx = makeCtx('prefix_except_default')
    const strategy = createPathStrategy(ctx)

    const origRouter = ctx.router
    const newRouter = makeRouter([{ name: 'test', path: '/test' }])
    strategy.setRouter(newRouter)

    // Old router is no longer referenced by ctx
    expect(ctx.router).toBe(newRouter)
    expect(ctx.router).not.toBe(origRouter)

    // Strategy works with new router
    const result = strategy.localeRoute('de', { name: 'test' })
    expect(result.path).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// 5. No accumulation in context
// ---------------------------------------------------------------------------

describe('Memory: context does not accumulate state', () => {
  for (const strategyName of STRATEGIES) {
    test(`${strategyName}: repeated calls don't add properties to ctx`, () => {
      const ctx = makeCtx(strategyName)
      const strategy = createPathStrategy(ctx)
      const ctxKeysBefore = Object.keys(ctx).sort()

      const current: ResolvedRouteLike = {
        name: 'about',
        path: '/about',
        fullPath: '/about',
        params: {},
        query: {},
        hash: '',
      }

      for (let i = 0; i < 1000; i++) {
        strategy.localeRoute('de', { name: 'about' }, current)
        strategy.localeRoute('en', '/contact', current)
        strategy.switchLocaleRoute('en', 'de', current, {})
        strategy.getRedirect('/about', 'de')
        strategy.getCurrentLocale(current)
        strategy.getPluginRouteName(current, 'de')
      }

      const ctxKeysAfter = Object.keys(ctx).sort()
      expect(ctxKeysAfter).toEqual(ctxKeysBefore)
    })
  }
})

// ---------------------------------------------------------------------------
// 6. Large globalLocaleRoutes stress test
// ---------------------------------------------------------------------------

describe('Memory: large globalLocaleRoutes', () => {
  test('no leak with 1000 route rules x 10k iterations', () => {
    const gr: Record<string, Record<string, string>> = {}
    for (let i = 0; i < 1000; i++) {
      gr[`route-${i}`] = { en: `/route-${i}`, de: `/route-de-${i}`, fr: `/route-fr-${i}` }
    }

    const ctx = makeCtx('prefix_except_default', { globalLocaleRoutes: gr })
    const strategy = createPathStrategy(ctx)
    const current: ResolvedRouteLike = {
      name: 'route-500',
      path: '/route-500',
      fullPath: '/route-500',
      params: {},
      query: {},
      hash: '',
    }

    // Warmup
    for (let i = 0; i < 500; i++) {
      strategy.localeRoute('de', { name: 'route-500' }, current)
    }

    if (global.gc) global.gc()
    const heapBefore = process.memoryUsage().heapUsed

    for (let i = 0; i < 10_000; i++) {
      const routeIdx = i % 1000
      strategy.localeRoute('de', { name: `route-${routeIdx}` }, current)
      strategy.localeRoute('fr', `/route-${routeIdx}`, current)
    }

    if (global.gc) global.gc()
    const heapAfter = process.memoryUsage().heapUsed

    const growthMB = (heapAfter - heapBefore) / 1024 / 1024
    expect(growthMB).toBeLessThan(10)
  })
})

// ---------------------------------------------------------------------------
// 7. Return values don't share references with internal state
// ---------------------------------------------------------------------------

describe('Isolation: returned objects are independent', () => {
  for (const strategyName of STRATEGIES) {
    test(`${strategyName}: modifying returned route doesn't affect next call`, () => {
      const strategy = createPathStrategy(makeCtx(strategyName))
      const current: ResolvedRouteLike = {
        name: 'about',
        path: '/about',
        fullPath: '/about',
        params: {},
        query: {},
        hash: '',
      }

      const result1 = strategy.localeRoute('de', '/about', current)
      const path1 = result1.path

      // Mutate the returned object
      result1.path = '/MUTATED'
      result1.fullPath = '/MUTATED'
      if (!result1.query) result1.query = {}
      ;(result1.query as any).injected = 'hack'

      // Next call should return fresh result
      const result2 = strategy.localeRoute('de', '/about', current)
      expect(result2.path).toBe(path1)
      expect(result2).not.toBe(result1) // different object reference
      expect((result2.query as any)?.injected).toBeUndefined()
    })
  }
})

// ---------------------------------------------------------------------------
// 8. Router adapter isolation
// ---------------------------------------------------------------------------

describe('Isolation: router adapter calls', () => {
  test('strategy does not store resolved routes internally', () => {
    let resolveCallCount = 0
    const router: RouterAdapter = {
      hasRoute: (name) => name === 'about' || name === 'localized-about-de',
      resolve: (to) => {
        resolveCallCount++
        const name = typeof to === 'string' ? to : (to?.name?.toString() ?? null)
        return {
          name,
          path: name === 'about' ? '/about' : name === 'localized-about-de' ? '/de/about' : '/',
          fullPath: name === 'about' ? '/about' : name === 'localized-about-de' ? '/de/about' : '/',
          params: typeof to === 'object' ? (to?.params ?? {}) : {},
          query: typeof to === 'object' ? (to?.query ?? {}) : {},
          hash: '',
        }
      },
    }

    const ctx = makeCtx('prefix_except_default', { router })
    const strategy = createPathStrategy(ctx)
    const current: ResolvedRouteLike = {
      name: 'about',
      path: '/about',
      fullPath: '/about',
      params: {},
      query: {},
      hash: '',
    }

    resolveCallCount = 0
    strategy.localeRoute('de', { name: 'about' }, current)
    const count1 = resolveCallCount

    resolveCallCount = 0
    strategy.localeRoute('de', { name: 'about' }, current)
    const count2 = resolveCallCount

    // Same number of resolve calls — no internal caching
    expect(count2).toBe(count1)
  })
})
