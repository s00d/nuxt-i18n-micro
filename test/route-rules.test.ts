import { describe, expect, test } from 'vitest'
import { buildTranslationPayloadRouteRule, shouldLocalizeRouteRulePath } from '../src/route-rules'

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

  test('sets no header in dev, so HMR is not answered from a cache', () => {
    expect(buildTranslationPayloadRouteRule({ dev: true, cacheControl: immutable })).toEqual({ cors: true })
  })

  test('never turns on the Nitro route cache (keyed by the full URL: unbounded)', () => {
    for (const cacheControl of [revalidate, immutable, null]) {
      expect(buildTranslationPayloadRouteRule({ dev: false, cacheControl })).not.toHaveProperty('cache')
    }
  })

  test('passes through the policy it is given', () => {
    expect(buildTranslationPayloadRouteRule({ dev: false, cacheControl: revalidate })).toEqual({
      cors: true,
      headers: { 'Cache-Control': revalidate },
    })
  })

  test('sets no header when caching is switched off entirely', () => {
    expect(buildTranslationPayloadRouteRule({ dev: false, cacheControl: null })).toEqual({ cors: true })
  })
})
