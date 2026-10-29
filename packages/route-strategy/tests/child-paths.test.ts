import type { NuxtPage } from '@nuxt/schema'
import { childSegment } from '../src/core/builder'
import { RouteGenerator } from '../src'
import { defaultLocaleCode, locales } from './helpers'
import { describe, expect, test } from 'vitest'

/** Full URL per route name, joining child paths onto their parents like vue-router. */
function urls(pages: NuxtPage[], parent = '', out: Record<string, string> = {}): Record<string, string> {
  for (const page of pages) {
    const full = page.path.startsWith('/') ? page.path : `${parent.replace(/\/$/, '')}/${page.path}`.replace(/\/$/, '') || '/'
    if (page.name) out[page.name] = full
    if (page.children) urls(page.children, full, out)
  }
  return out
}

describe('childSegment', () => {
  test.each([
    ['/activity', 'book-activity/skiing', 'book-activity/skiing'],
    ['/activity', '/book-activity/skiing', 'book-activity/skiing'],
    ['/bereich', '/bereich/kategorie', 'kategorie'],
    ['/bereich', '/bereich', ''],
    ['/:locale(de)/bereich', '/bereich/kategorie', 'kategorie'],
    ['/bereich/kategorie', '/bereich/artikel', 'artikel'],
    ['/bereich/kategorie', 'bereich/artikel', 'bereich/artikel'],
    ['/bereich', 'bereich/kategorie', 'bereich/kategorie'],
    ['/', '/team', 'team'],
  ])('under %s, %s is %s', (parent, value, expected) => {
    expect(childSegment(parent, value)).toBe(expected)
  })
})

describe('child custom paths', () => {
  const nested = (): NuxtPage[] => [
    {
      path: '/parent',
      name: 'parent',
      children: [{ path: 'child', name: 'parent-child', children: [{ path: 'leaf', name: 'parent-child-leaf' }] }],
    },
  ]

  test('prefix_and_default: the unprefixed default route localizes its children and keeps their names', () => {
    const pages = nested()
    new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_and_default',
      globalLocaleRoutes: { '/parent': { en: '/eltern' }, '/parent/child': { en: 'kind' } },
      routeLocales: {},
      noPrefixRedirect: false,
    }).extendPages(pages)
    const map = urls(pages)
    expect(map.parent).toBe('/eltern')
    expect(map['parent-child']).toBe('/eltern/kind')
    expect(map['parent-child-leaf']).toBe('/eltern/kind/leaf')
    expect(map['localized-parent-child-en']).toBe('/:locale(en)/eltern/kind')
  })

  test('prefix_except_default: a full-URL leaf that skips an uncustomized level is not doubled', () => {
    const pages = nested()
    new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix_except_default',
      globalLocaleRoutes: { '/parent': { de: '/eltern' }, '/parent/child/leaf': { de: '/eltern/blatt' } },
      routeLocales: {},
      noPrefixRedirect: false,
    }).extendPages(pages)
    expect(urls(pages)['localized-parent-child-leaf-de']).toBe('/:locale(de)/eltern/child/blatt')
  })

  test('prefix: the shared route of locales without a custom path keeps the encoded alias', () => {
    const pages: NuxtPage[] = [{ path: '/über', name: 'ueber' }]
    new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: { '/über': { de: '/ueber-uns' } },
      routeLocales: {},
      noPrefixRedirect: false,
    }).extendPages(pages)
    const shared = pages.find((p) => p.name === 'localized-ueber')!
    expect(shared.path).toBe('/:locale(en|ru)/über')
    expect(shared.alias).toEqual([encodeURI('/:locale(en|ru)/über').replace(encodeURI(':locale(en|ru)'), ':locale(en|ru)')])
  })

  test('prefix: under a shared parent, locales without a child value share one plain child listed first', () => {
    const pages: NuxtPage[] = [{ path: '/about', name: 'about', children: [{ path: 'team', name: 'about-team' }] }]
    new RouteGenerator({
      locales: [...locales, { code: 'fr', iso: 'fr-FR' }],
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: { 'about-team': { en: '/a-en', de: '/about/team' } },
      routeLocales: {},
      noPrefixRedirect: false,
    }).extendPages(pages)
    const children = pages.find((p) => p.name === 'localized-about')!.children!.map((c) => `${c.name} ${c.path}`)
    expect(children[0]).toBe('localized-about-team team')
    expect(children).toContain('localized-about-team-en a-en')
    expect(children).not.toContain('localized-about-team-fr team')
  })

  test('prefix: redirect routes for `about-team` and `about/team` keys get distinct names', () => {
    const pages: NuxtPage[] = [{ path: '/about-team', name: 'about-team' }]
    new RouteGenerator({
      locales,
      defaultLocaleCode,
      strategy: 'prefix',
      globalLocaleRoutes: { 'about-team': { en: '/a-en' }, 'about/team': { en: '/b-en' } },
      routeLocales: {},
      noPrefixRedirect: false,
    }).extendPages(pages)
    const redirects = pages.filter((p) => p.redirect).map((p) => p.name)
    expect(new Set(redirects).size).toBe(redirects.length)
  })

  test.each(['prefix_and_default', 'no_prefix', 'prefix_except_default'] as const)(
    '%s: the unprefixed default route accepts the percent-encoded URL of a non-ASCII path',
    (strategy) => {
      const pages: NuxtPage[] = [{ path: '/тест', name: 'test-ru' }]
      new RouteGenerator({ locales, defaultLocaleCode, strategy, globalLocaleRoutes: {}, routeLocales: {}, noPrefixRedirect: false }).extendPages(
        pages,
      )
      const base = pages.find((p) => p.name === 'test-ru')!
      expect(base.alias).toContain(encodeURI('/тест'))
    },
  )
})
