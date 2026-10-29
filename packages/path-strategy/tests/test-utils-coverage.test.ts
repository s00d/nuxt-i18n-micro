/**
 * Tests for test-utils.ts - coverage for all branches
 */

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'
import { describe, expect, test } from 'vitest'

describe('makeRouterAdapter', () => {
  describe('resolve with string input', () => {
    test('resolves a string as a path and matches the route table', () => {
      const router = makeRouterAdapter({ 'test-route': '/test-route' })
      const result = router.resolve('/test-route')

      expect(result.name).toBe('test-route')
      expect(result.path).toBe('/test-route')
      expect(result.fullPath).toBe('/test-route')
    })

    test('extracts params from a matched path, honouring regex params', () => {
      const router = makeRouterAdapter({ 'localized-news-id-de': '/:locale(de)/nachrichten/:id' })

      expect(router.resolve('/de/nachrichten/7')).toMatchObject({ name: 'localized-news-id-de', params: { locale: 'de', id: '7' } })
      expect(router.resolve('/en/nachrichten/7').name).toBeNull()
    })

    test('an unmatched string path resolves to no route instead of throwing', () => {
      const router = makeRouterAdapter(['known-route'], { throwOnUnknownName: true })

      expect(router.resolve('/unknown-route')).toMatchObject({ name: null, path: '/unknown-route' })
    })
  })

  describe('resolve with object input', () => {
    test('resolves object route', () => {
      const router = makeRouterAdapter(['page'])
      const result = router.resolve({ name: 'page', path: '/page' })

      expect(result.name).toBe('page')
      expect(result.path).toBe('/page')
    })

    test('throws when object route name not found and throwOnUnknownName is true', () => {
      const router = makeRouterAdapter(['known'], { throwOnUnknownName: true })

      expect(() => router.resolve({ name: 'unknown' })).toThrow('Unknown route name: unknown')
    })

    test('uses pathFromName to build path from params', () => {
      const router = makeRouterAdapter(['products-id'], {
        pathFromName: (name, params) => {
          if (name === 'products-id' && params.id) {
            return `/products/${params.id}`
          }
          return null
        },
      })

      const result = router.resolve({ name: 'products-id', params: { id: '123' } })

      expect(result.path).toBe('/products/123')
      expect(result.fullPath).toBe('/products/123')
    })

    test('does not use pathFromName when path is already provided', () => {
      const router = makeRouterAdapter(['page'], {
        pathFromName: () => '/built-path',
      })

      const result = router.resolve({ name: 'page', path: '/original-path', params: { id: '1' } })

      expect(result.path).toBe('/original-path')
    })

    test('a name without a known path throws instead of answering /', () => {
      const router = makeRouterAdapter(['page'], {
        pathFromName: () => null,
      })

      expect(() => router.resolve({ name: 'page', params: { id: '1' } })).toThrow('no path registered for route "page"')
    })

    test('fills the path template from params', () => {
      const router = makeRouterAdapter({ 'localized-products-id': '/:locale(en|de)/products/:id', slug: '/blog/:slug(.*)*' })

      expect(router.resolve({ name: 'localized-products-id', params: { locale: 'de', id: '5' } }).path).toBe('/de/products/5')
      expect(router.resolve({ name: 'slug', params: { slug: ['a', 'b'] } }).path).toBe('/blog/a/b')
      expect(router.resolve({ name: 'slug', params: {} }).path).toBe('/blog')
    })

    test('throws on a missing required param, like vue-router', () => {
      const router = makeRouterAdapter({ 'localized-about-de': '/:locale(de)/about' })

      expect(() => router.resolve({ name: 'localized-about-de' })).toThrow('Missing required param "locale"')
    })

    test('handles route without name', () => {
      const router = makeRouterAdapter([])
      const result = router.resolve({ path: '/some-path' })

      expect(result.name).toBeNull()
      expect(result.path).toBe('/some-path')
    })

    test('handles route with fullPath but no path', () => {
      const router = makeRouterAdapter(['test'])
      const result = router.resolve({ name: 'test', fullPath: '/full/path' })

      expect(result.fullPath).toBe('/full/path')
    })
  })

  describe('hasRoute', () => {
    test('returns true for existing route', () => {
      const router = makeRouterAdapter(['my-route'])

      expect(router.hasRoute('my-route')).toBe(true)
    })

    test('returns false for non-existing route', () => {
      const router = makeRouterAdapter(['my-route'])

      expect(router.hasRoute('other-route')).toBe(false)
    })
  })
})

describe('makePathStrategyContext', () => {
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

  test('creates context with default values', () => {
    const ctx = makePathStrategyContext(baseConfig, 'prefix_except_default')

    expect(ctx.strategy).toBe('prefix_except_default')
    expect(ctx.defaultLocale).toBe('en')
    expect(ctx.locales).toHaveLength(2)
    expect(ctx.localizedRouteNamePrefix).toBe('localized-')
    expect(ctx.router).toBeDefined()
  })

  test('uses custom localizedRouteNamePrefix', () => {
    const config: ModuleOptionsExtend = {
      ...baseConfig,
      localizedRouteNamePrefix: 'i18n-',
    }
    const ctx = makePathStrategyContext(config, 'prefix')

    expect(ctx.localizedRouteNamePrefix).toBe('i18n-')
  })

  test('merges extra properties', () => {
    const ctx = makePathStrategyContext(baseConfig, 'prefix', {
      globalLocaleRoutes: { page: { en: '/page', de: '/seite' } },
      hashMode: true,
    })

    expect(ctx.globalLocaleRoutes).toEqual({ page: { en: '/page', de: '/seite' } })
    expect(ctx.hashMode).toBe(true)
  })

  test('extra properties override defaults', () => {
    const customRouter = makeRouterAdapter(['custom'])
    const ctx = makePathStrategyContext(baseConfig, 'prefix', {
      router: customRouter,
    })

    expect(ctx.router).toBe(customRouter)
  })
})
