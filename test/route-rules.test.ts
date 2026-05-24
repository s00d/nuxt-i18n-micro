import { describe, expect, test } from 'vitest'
import { shouldLocalizeRouteRulePath } from '../src/route-rules'

describe('routeRules localization', () => {
  test.each([
    '/',
    '/about',
    '/products/**',
    '/blog/:slug',
    '/tools/_assets',
    '/apiary',
    '/apiary/**',
  ])('localizes public route rule %s', (routeRulePath) => {
    expect(shouldLocalizeRouteRulePath(routeRulePath)).toBe(true)
  })

  test.each([
    '/api',
    '/api/users',
    '/api/**',
    '/_nuxt/**',
    '/_locales/**',
    '/__nuxt_content/**',
    '/__sitemap__/**',
  ])('skips internal route rule %s', (routeRulePath) => {
    expect(shouldLocalizeRouteRulePath(routeRulePath)).toBe(false)
  })

  test('localizes root path', () => {
    expect(shouldLocalizeRouteRulePath('/')).toBe(true)
  })
})
