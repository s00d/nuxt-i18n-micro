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
})
