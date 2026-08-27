/**
 * localeRoute with a string input like '/products?sort=price' must return the
 * query and hash as separate fields, not embedded in `path`: vue-router
 * ignores a query string inside an object location's `path`, so a NuxtLink
 * fed such a result navigates without the params.
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'
import { describe, expect, test } from 'vitest'

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

type StrategyName = 'prefix_except_default' | 'prefix' | 'prefix_and_default' | 'no_prefix'

function makeStrategy(strategy: StrategyName, extra?: Partial<PathStrategyContext>) {
  const router = makeRouterAdapter(['products', 'localized-products-en', 'localized-products-de'])
  return createPathStrategy(makePathStrategyContext(baseConfig, strategy, { router, ...extra }))
}

const prefixed: Record<StrategyName, boolean> = {
  prefix_except_default: false,
  prefix: true,
  prefix_and_default: true,
  no_prefix: false,
}

function runStringQueryTests(strategy: StrategyName) {
  const enPath = prefixed[strategy] ? '/en/products' : '/products'

  test('string path with query: query must survive as a separate field', () => {
    const s = makeStrategy(strategy)
    const result = s.localeRoute('en', '/products?sort=price')
    expect(result.path).toBe(enPath)
    expect(result.query).toEqual({ sort: 'price' })
    expect(result.fullPath).toBe(`${enPath}?sort=price`)
  })

  test('string path with query for a prefixed locale', () => {
    const s = makeStrategy(strategy)
    const result = s.localeRoute('de', '/products?sort=price')
    const dePath = strategy === 'no_prefix' ? '/products' : '/de/products'
    expect(result.path).toBe(dePath)
    expect(result.query).toEqual({ sort: 'price' })
    expect(result.fullPath).toBe(`${dePath}?sort=price`)
  })

  test('string path with multiple query params and hash', () => {
    const s = makeStrategy(strategy)
    const result = s.localeRoute('en', '/products?a=1&b=2#frag')
    expect(result.path).toBe(enPath)
    expect(result.query).toEqual({ a: '1', b: '2' })
    expect(result.hash).toBe('#frag')
    expect(result.fullPath).toBe(`${enPath}?a=1&b=2#frag`)
  })

  test('string path with hash only', () => {
    const s = makeStrategy(strategy)
    const result = s.localeRoute('en', '/products#frag')
    expect(result.path).toBe(enPath)
    expect(result.hash).toBe('#frag')
    expect(result.fullPath).toBe(`${enPath}#frag`)
  })

  test('string path with an empty query or hash drops them from both fields', () => {
    const s = makeStrategy(strategy)
    const withEmptyHash = s.localeRoute('en', '/products#')
    expect(withEmptyHash.hash).toBeUndefined()
    expect(withEmptyHash.fullPath).toBe(enPath)
    const withEmptyQuery = s.localeRoute('en', '/products?')
    expect(withEmptyQuery.query).toBeUndefined()
    expect(withEmptyQuery.fullPath).toBe(enPath)
  })

  test('string path with repeated query key parses to an array', () => {
    const s = makeStrategy(strategy)
    const result = s.localeRoute('en', '/products?tag=a&tag=b')
    expect(result.query).toEqual({ tag: ['a', 'b'] })
    expect(result.fullPath).toBe(`${enPath}?tag=a&tag=b`)
  })

  test('string path without query/hash is unaffected', () => {
    const s = makeStrategy(strategy)
    const result = s.localeRoute('en', '/products')
    expect(result.path).toBe(enPath)
    expect(result.query).toBeUndefined()
    expect(result.fullPath).toBe(enPath)
  })
}

describe('localeRoute: string input with embedded query/hash', () => {
  describe('prefix_except_default', () => {
    runStringQueryTests('prefix_except_default')
  })

  describe('prefix', () => {
    runStringQueryTests('prefix')
  })

  describe('prefix_and_default', () => {
    runStringQueryTests('prefix_and_default')
  })

  describe('no_prefix', () => {
    runStringQueryTests('no_prefix')
  })

  test('custom path lookup is not defeated by an embedded query', () => {
    const s = makeStrategy('prefix_except_default', {
      globalLocaleRoutes: { products: { en: '/catalog', de: '/katalog' } },
      _hasGR: true,
    })
    const result = s.localeRoute('de', '/products?sort=price')
    expect(result.path).toBe('/de/katalog')
    expect(result.query).toEqual({ sort: 'price' })
    expect(result.fullPath).toBe('/de/katalog?sort=price')
  })

  // applyBaseUrl returns an absolute URL string for path-kind inputs; query/hash
  // must still be merged in _ensureRouteLike (same footgun as relative paths).
  test('string query and hash survive when the target locale has baseUrl', () => {
    const s = makeStrategy('prefix_except_default', {
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'de', iso: 'de-DE', baseUrl: 'https://de.example.com' },
      ],
    })
    const result = s.localeRoute('de', '/products?sort=price#frag')
    expect(result.path).toBe('https://de.example.com/de/products')
    expect(result.query).toEqual({ sort: 'price' })
    expect(result.hash).toBe('#frag')
    expect(result.fullPath).toBe('https://de.example.com/de/products?sort=price#frag')
  })

  test('encoded query values are decoded like vue-router does', () => {
    const s = makeStrategy('prefix_except_default')
    const result = s.localeRoute('en', '/products?redirect=%2Fdashboard%3Ftab%3D1')
    expect(result.query).toEqual({ redirect: '/dashboard?tab=1' })
  })

  test('flag param without a value survives in query and fullPath', () => {
    const s = makeStrategy('prefix_except_default')
    const result = s.localeRoute('en', '/products?flag')
    expect(result.query).toEqual({ flag: '' })
    expect(result.fullPath).toBe('/products?flag=')
  })
})
