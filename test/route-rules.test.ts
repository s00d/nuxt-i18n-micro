import { describe, expect, test } from 'vitest'
import { RouteGenerator } from '@i18n-micro/route-strategy'
import { buildTranslationPayloadRouteRule, localizeRouteRules, shouldLocalizeRouteRulePath, varyRouteCacheByHost } from '../src/route-rules'

describe('routeRules', () => {
  test('a page rule reaches its localized URLs; a redirect, an api rule and a restricted locale do not', () => {
    const generator = new RouteGenerator({
      locales: [{ code: 'en' }, { code: 'de' }, { code: 'fr' }],
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: { about: { de: '/ueber-uns' } },
      routeLocales: { '/de-only': ['de'] },
      noPrefixRedirect: false,
    })
    const target: Record<string, object> = { '/de/old': { headers: {} } }
    const copied: string[] = []
    localizeRouteRules(
      {
        '/old': { swr: 60, redirect: '/new' },
        '/gone': { redirect: '/new' },
        '/api/**': { cors: true },
        '/de-only': { swr: 1 },
      },
      target,
      generator,
      (path) => copied.push(path),
    )
    expect(target).toEqual({
      '/de/old': { headers: {}, swr: 60 },
      '/fr/old': { swr: 60 },
      '/de/de-only': { swr: 1 },
    })
    expect(copied).toEqual(['/de/old', '/fr/old', '/de/de-only'])
  })

  test('a cached rule of a domain build keys on the host, one that caches nothing stays as written', () => {
    expect(varyRouteCacheByHost({ swr: 60 }, false)).toEqual({ swr: 60, cache: { varies: ['host'] } })
    expect(varyRouteCacheByHost({ cache: { varies: ['cookie', 'host'] } }, true)).toEqual({
      cache: { varies: ['cookie', 'host', 'x-forwarded-host'] },
    })
    for (const rule of [{}, { swr: false }, { swr: 60, cache: false as const }]) expect(varyRouteCacheByHost(rule, true)).toBe(rule)
  })

  test('page rules are localized, internal ones are not; the payload rule carries only the given policy', () => {
    // step 1: user pages (prefix look-alikes such as /apiary included) get a localized copy
    for (const path of ['/', '/about', '/products/**', '/blog/:slug', '/tools/_assets', '/apiary', '/apiary/**']) {
      expect(shouldLocalizeRouteRulePath(path)).toBe(true)
    }

    // step 2: api, build assets, payloads and other modules' internals stay as written
    for (const path of ['/api', '/api/users', '/api/**', '/_nuxt/**', '/_locales/**', '/__nuxt_content/**', '/__sitemap__/**']) {
      expect(shouldLocalizeRouteRulePath(path)).toBe(false)
    }

    // a rule already under a locale prefix: a copy per locale would be /fr/de/prerendered, a 404 in prerender
    for (const path of ['/de', '/de/prerendered', '/de/**']) expect(shouldLocalizeRouteRulePath(path, ['en', 'de'])).toBe(false)
    for (const path of ['/about', '/delivery/**']) expect(shouldLocalizeRouteRulePath(path, ['en', 'de'])).toBe(true)

    // step 3: the `_locales` rule: no header in dev (HMR must not be answered from a cache),
    // the configured Cache-Control in production, none when none is configured
    const revalidate = 'public, max-age=0, must-revalidate'
    expect(buildTranslationPayloadRouteRule({ dev: true, cacheControl: 'public, max-age=31536000, immutable' })).toEqual({ cors: true })
    expect(buildTranslationPayloadRouteRule({ dev: false, cacheControl: null })).toEqual({ cors: true })
    expect(buildTranslationPayloadRouteRule({ dev: false, cacheControl: revalidate })).toEqual({
      cors: true,
      headers: { 'Cache-Control': revalidate },
    })
  })
})
