import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, test } from 'vitest'
import { normalizeRouteKey, removeLeadingSlash, RouteGenerator } from '../src/index'

/**
 * Regression for https://github.com/s00d/nuxt-i18n-micro/issues/254
 *
 * $defineI18nRoute keys come from the filesystem (`events/[slug]/[id]`),
 * while Nuxt resolves the page as `/events/:slug()/:id()`. Those must match
 * after normalizeRouteKey so custom localeRoutes are applied.
 */
describe('issue #254: dynamic localeRoutes from $defineI18nRoute', () => {
  test('normalizeRouteKey: filesystem key and Nuxt :param() path share a canonical form', () => {
    const fromFile = removeLeadingSlash(normalizeRouteKey('events/[slug]/[id]'))
    const fromNuxt = removeLeadingSlash(normalizeRouteKey('/events/:slug()/:id()'))
    expect(fromFile).toBe('events/:slug/:id')
    expect(fromNuxt).toBe('events/:slug/:id')
    expect(fromFile).toBe(fromNuxt)
  })

  test('normalizeRouteKey: strips empty () but keeps non-empty matchers', () => {
    expect(normalizeRouteKey('/news/:id()')).toBe('/news/:id')
    expect(normalizeRouteKey('/:locale(de|en)/about')).toBe('/:locale(de|en)/about')
    expect(normalizeRouteKey('/posts/:id(\\d+)')).toBe('/posts/:id(\\d+)')
  })

  test('prefix strategy: applies StackBlitz localeRoutes on Nuxt dynamic page path', () => {
    const generator = new RouteGenerator({
      locales: [
        { code: 'de', iso: 'de', language: 'de-DE', name: 'Deutsch' },
        { code: 'en', iso: 'en', language: 'en-US', name: 'English' },
      ],
      defaultLocaleCode: 'de',
      strategy: 'prefix',
      globalLocaleRoutes: {
        'events/[slug]/[id]': {
          de: '/konzerte/:slug()/:id()',
          en: '/concerts/:slug()/:id()',
        },
      },
      noPrefixRedirect: false,
      excludePatterns: ['/webshop'],
    })

    const pages: NuxtPage[] = [{ path: '/events/:slug()/:id()', name: 'events-slug-id' }]
    generator.extendPages(pages)

    const paths = pages.map((p) => p.path ?? '')
    const names = pages.map((p) => p.name ?? '')

    expect(paths.some((p) => p.includes('/konzerte/'))).toBe(true)
    expect(paths.some((p) => p.includes('/concerts/'))).toBe(true)
    expect(paths.some((p) => p === '/:locale(de|en)/events/:slug()/:id()')).toBe(false)

    expect(names).toContain('localized-events-slug-id-de')
    expect(names).toContain('localized-events-slug-id-en')
  })
})
