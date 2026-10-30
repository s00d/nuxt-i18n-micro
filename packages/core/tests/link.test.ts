import { describe, expect, it } from 'vitest'
import { externalLinkHref, isActiveLink, isPlainClick, isSamePage, localizedPath, routeQuery } from '../src/link'

describe('routeQuery', () => {
  it.each([
    ['', {}],
    ['?a=1', { a: '1' }],
    ['?tag=a&tag=b&tag=c&x=1', { tag: ['a', 'b', 'c'], x: '1' }],
    ['?a=&a=', { a: ['', ''] }],
  ])('%s', (search, query) => {
    expect(routeQuery(search)).toEqual(query)
  })

  it('a key named like a prototype member stays a plain own key', () => {
    const query = routeQuery('?__proto__=x&constructor=y')
    expect(Object.getPrototypeOf(query)).toBe(Object.prototype)
    expect(Object.keys(query)).toEqual(['__proto__', 'constructor'])
  })
})

describe('externalLinkHref', () => {
  it.each([
    ['https://example.com/a', 'https://example.com/a'],
    ['http://example.com', 'http://example.com'],
    ['//cdn.example.com/a.js', '//cdn.example.com/a.js'],
    ['tel:+100', 'tel:+100'],
    ['mailto:hi@example.com', 'mailto:hi@example.com'],
    ['example.com/login', 'https://example.com/login'],
    ['www.example.com', 'https://www.example.com'],
    ['example.com/report.pdf', 'https://example.com/report.pdf'],
    ['example.com?x=1', 'https://example.com?x=1'],
    ['example.com:8080', 'https://example.com:8080'],
    ['example.com:8080/a', 'https://example.com:8080/a'],
    ['example.com.', 'https://example.com.'],
    ['example.com./a', 'https://example.com./a'],
    ['HTTPS://example.com', 'HTTPS://example.com'],
    ['Mailto:hi@example.com', 'Mailto:hi@example.com'],
    ['TEL:+100', 'TEL:+100'],
  ])('%s leaves the app as %s', (to, href) => {
    expect(externalLinkHref(to)).toBe(href)
  })

  it.each([
    '/about',
    '/contact/tel:100',
    '/mailto:a',
    'about',
    '',
    'report.pdf',
    'index.html',
    'INDEX.HTM',
    'data.json?x=1',
    'a.b',
    'javascript:alert(1)',
    { path: 'https://example.com' },
  ])('%j stays a route', (to) => {
    expect(externalLinkHref(to)).toBeUndefined()
  })
})

describe('isSamePage', () => {
  it.each([
    ['/about', '/about'],
    ['/about', '/about/'],
    ['/about', '/about?x=1'],
    ['/about', '/about#top'],
    ['/about/?x=1#y', '/about'],
    ['/', ''],
    ['/', '/?x=1'],
  ])('%s is %s', (a, b) => {
    expect(isSamePage(a, b)).toBe(true)
  })

  it.each([
    ['/about', '/about/team'],
    ['/about', '/'],
    ['/de/about', '/about'],
  ])('%s is not %s', (a, b) => {
    expect(isSamePage(a, b)).toBe(false)
  })
})

describe('isPlainClick', () => {
  const click = (init: Partial<MouseEvent> & { target?: string; download?: string } = {}) => {
    const { target, download, ...event } = init
    const attrs: Record<string, string | undefined> = { target, download }
    const getAttribute = (name: string) => attrs[name] ?? null
    const hasAttribute = (name: string) => attrs[name] !== undefined
    return { defaultPrevented: false, button: 0, currentTarget: { getAttribute, hasAttribute }, ...event } as unknown as MouseEvent
  }

  it('a primary click on a link without a target', () => {
    expect(isPlainClick(click())).toBe(true)
    expect(isPlainClick(click({ target: '_self' }))).toBe(true)
  })

  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
    { defaultPrevented: true },
    { target: '_blank' },
    { download: '' },
    { download: 'report.pdf' },
  ])('not with %j', (init) => {
    expect(isPlainClick(click(init))).toBe(false)
  })
})

describe('isActiveLink', () => {
  it.each([
    ['/about', '/about', true],
    ['/about/', '/about', true],
    ['/about?x=1#y', '/about', true],
    ['/about', '/about?x=1', true],
    ['/about/team', '/about', true],
    ['/about-us', '/about', false],
    ['/about', '/about/team', false],
    ['/de', '/de', true],
    ['/de/about', '/de', false],
    ['/about', '/', false],
    ['/', '/', true],
  ])('%s with a link to %s: %s', (current, link, active) => {
    expect(isActiveLink(current, link, ['en', 'de'])).toBe(active)
  })
})

describe('localizedPath', () => {
  const codes = ['en', 'de', 'fr']
  it.each([
    ['/', 'en', '/'],
    ['/', 'de', '/de'],
    ['/about', 'de', '/de/about'],
    ['about', 'de', '/de/about'],
    ['/de', 'en', '/'],
    ['/de/about', 'fr', '/fr/about'],
    ['/de?x=1', 'en', '/?x=1'],
    ['/de#top', 'fr', '/fr#top'],
    ['/de/a?x=1#y', 'fr', '/fr/a?x=1#y'],
    ['/about?next=/de/x', 'de', '/de/about?next=/de/x'],
    ['/deutsch', 'en', '/deutsch'],
    ['#top', 'de', '#top'],
    ['?x=1', 'en', '?x=1'],
  ])('%s in %s is %s', (to, locale, path) => {
    expect(localizedPath(to, locale, codes, 'en')).toBe(path)
  })

  it('takes a location object', () => {
    expect(localizedPath({ path: '/de/a' }, 'en', codes, 'en')).toBe('/a')
    expect(localizedPath({}, 'de', codes, 'en')).toBe('/de')
  })
})
