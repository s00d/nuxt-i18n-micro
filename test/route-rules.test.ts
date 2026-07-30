import { describe, expect, test } from 'vitest'
import { PAYLOAD_ROUTE_CACHE_MAX_AGE, buildTranslationPayloadRouteRule, shouldLocalizeRouteRulePath } from '../src/route-rules'

describe('routeRules localization', () => {
  test.each(['/', '/about', '/products/**', '/blog/:slug', '/tools/_assets', '/apiary', '/apiary/**'])(
    'localizes public route rule %s',
    (routeRulePath) => {
      expect(shouldLocalizeRouteRulePath(routeRulePath)).toBe(true)
    },
  )

  test.each(['/api', '/api/users', '/api/**', '/_nuxt/**', '/_locales/**', '/__nuxt_content/**', '/__sitemap__/**'])(
    'skips internal route rule %s',
    (routeRulePath) => {
      expect(shouldLocalizeRouteRulePath(routeRulePath)).toBe(false)
    },
  )

  test('localizes root path', () => {
    expect(shouldLocalizeRouteRulePath('/')).toBe(true)
  })
})

describe('translation payload route rule', () => {
  const immutable = 'public, max-age=31536000, immutable'
  const revalidate = 'public, max-age=0, must-revalidate'

  test('caches nothing in dev, so HMR is not answered from a cache', () => {
    expect(buildTranslationPayloadRouteRule({ dev: true, hasCacheBuster: true, cacheControl: immutable })).toEqual({ cors: true })
  })

  test('caches server-side only while ?v= makes each URL unique to its content', () => {
    // The header the module passes here is the conservative one — see the next test.
    expect(buildTranslationPayloadRouteRule({ dev: false, hasCacheBuster: true, cacheControl: revalidate })).toEqual({
      cors: true,
      cache: { maxAge: PAYLOAD_ROUTE_CACHE_MAX_AGE, swr: true },
      headers: { 'Cache-Control': revalidate },
    })
  })

  test('passes through whatever policy it is given, including an immutable one', () => {
    // The rule itself takes no view; the caller decides, because only the handler can see
    // whether the request carried `?v=`.
    expect(buildTranslationPayloadRouteRule({ dev: false, hasCacheBuster: true, cacheControl: immutable }).headers).toEqual({
      'Cache-Control': immutable,
    })
  })

  test('does not cache a stable URL, which would defeat its own must-revalidate', () => {
    // The header says the content behind this URL can change; a 60s stale-while-revalidate
    // entry would answer from the old one anyway.
    expect(buildTranslationPayloadRouteRule({ dev: false, hasCacheBuster: false, cacheControl: revalidate })).toEqual({
      cors: true,
      headers: { 'Cache-Control': revalidate },
    })
  })

  test('sets no header when caching is switched off entirely', () => {
    // `null` from the builder already means "no header" — the caller must not re-derive it.
    expect(buildTranslationPayloadRouteRule({ dev: false, hasCacheBuster: true, cacheControl: null })).toEqual({
      cors: true,
      cache: { maxAge: PAYLOAD_ROUTE_CACHE_MAX_AGE, swr: true },
    })
  })

  test('always allows cross-origin reads, so a CDN host can serve the payloads', () => {
    for (const dev of [true, false]) {
      expect(buildTranslationPayloadRouteRule({ dev, hasCacheBuster: false, cacheControl: null }).cors).toBe(true)
    }
  })
})
