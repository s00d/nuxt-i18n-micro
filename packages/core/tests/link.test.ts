import { describe, expect, it } from 'vitest'
import { externalLinkHref, isActiveLink, isPlainClick, isSamePage, localizedPath, pathEnd, routeQuery, urlPath, withoutDots } from '../src/link'

describe('routeQuery', () => {
  it.each([
    ['', {}],
    ['?a=1', { a: '1' }],
    ['?tag=a&tag=b&tag=c&x=1', { tag: ['a', 'b', 'c'], x: '1' }],
    ['?a=&a=', { a: ['', ''] }],
    ['?flag', { flag: null }],
    ['?flag=', { flag: '' }],
    ['?a&a=1&&b', { a: [null, '1'], b: null }],
    ['?q=a+b%20c', { q: 'a b c' }],
    ['?q=%2B', { q: '+' }],
    // as vue-router: a value that does not decode stays as written, with no U+FFFD
    ['?a=%E0%A4%A&b=%E0%A4%A5', { a: '%E0%A4%A', b: 'थ' }],
    ['?%E0%A4%A=1', { '%E0%A4%A': '1' }],
    ['?a=%zz', { a: '%zz' }],
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

describe('a path as the request wrote it and as a link holds it', () => {
  it.each([
    ['/caf%C3%A9', '/café'],
    ['/café', '/caf%C3%A9'],
    ['/news/a b', '/news/a%20b'],
    ['/caf%C3%A9/?x=1', '/café'],
  ])('%s is %s', (a, b) => {
    expect(isSamePage(a, b)).toBe(true)
    expect(isActiveLink(a, b, ['en', 'de'])).toBe(true)
  })

  it('a section above it', () => {
    expect(isActiveLink('/caf%C3%A9/menu', '/café', ['en', 'de'])).toBe(true)
  })

  it('what does not decode stays as written, and an encoded slash stays one', () => {
    expect(isSamePage('/100%', '/100%')).toBe(true)
    expect(isSamePage('/100%/a', '/100%/b')).toBe(false)
    expect(isSamePage('/a%2Fb', '/a/b')).toBe(false)
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
  it.each(['\\evil.example', '/\\evil.example', '/de/\\evil.example', '/\t/evil.example', '/de/\n/evil.example'])('%j stays on this origin', (to) => {
    expect(localizedPath(to, 'en', ['en', 'de'], 'en')).toBe('/evil.example')
    expect(localizedPath(to, 'de', ['en', 'de'], 'en')).toBe('/de/evil.example')
  })

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

describe('the path of a URL', () => {
  it.each(['\n', '\r', ' ', ' '])('a line end after `?` or `#` is part of them: %j', (end) => {
    expect(isSamePage(`/a?b${end}c`, '/a')).toBe(true)
    expect(isSamePage(`/a#b${end}c`, '/a')).toBe(true)
  })

  it('stays linear on a query full of `?` that holds a line end', () => {
    const href = `/a${'?'.repeat(1 << 16)}\n`
    const start = performance.now()
    expect(isSamePage(href, '/a')).toBe(true)
    expect(performance.now() - start).toBeLessThan(500)
  })

  it('cuts at the first of `?` and `#`', () => {
    expect(pathEnd('/a')).toBe(-1)
    expect(pathEnd('/a?b#c')).toBe(2)
    expect(pathEnd('/a#b?c')).toBe(2)
    expect(urlPath('/a?b')).toBe('/a')
    expect(urlPath('/a')).toBe('/a')
    expect(urlPath('?b')).toBe('')
  })
})

describe('a link cannot climb out of the locale prefix', () => {
  const codes = ['en', 'de']
  const read = (to: string, locale: string) => new URL(localizedPath(to, locale, codes, 'en'), 'https://host.test/')

  it.each([
    ['/../x', '/de/x'],
    ['/a/../../x', '/de/x'],
    ['/%2e%2e/x', '/de/x'],
    ['/.%2E/x', '/de/x'],
    ['/..\\x', '/de/x'],
    ['/.\t./x', '/de/x'],
    ['/..\x01', '/de'],
    ['/de/../x', '/de/x'],
    ['/a/./b', '/de/a/b'],
    ['/a/b/..', '/de/a'],
    ['/a/../b?x=1#y', '/de/b?x=1#y'],
    ['/a.b/c', '/de/a.b/c'],
    ['/%2fx', '/de/%2fx'],
  ])('%j is %s', (to, path) => {
    expect(localizedPath(to, 'de', codes, 'en')).toBe(path)
  })

  it('a default locale link has no prefix to leave', () => {
    expect(localizedPath('/de/../x', 'en', codes, 'en')).toBe('/x')
    expect(localizedPath('/../..', 'en', codes, 'en')).toBe('/')
  })

  it('stays under the prefix and on this origin, on any string', () => {
    // seeded: a failure names its string, and the run repeats it
    let seed = 11
    const next = (n: number) => ((seed = (seed * 1664525 + 1013904223) >>> 0) >>> 8) % n
    const atoms = [
      '/',
      '/',
      '\\',
      '.',
      '..',
      '%2e',
      '%2E',
      '%2',
      '\t',
      '\n',
      '\r',
      ' ',
      '\x01',
      '\x7f',
      '\xa0',
      'a',
      'de',
      'en',
      '%2f',
      '%5c',
      '?',
      '#',
      ':',
      '@',
    ]
    for (let i = 0; i < 200_000; i++) {
      let to = next(4) === 0 ? '' : '/'
      for (let n = next(9); n >= 0; n--) to += atoms[next(atoms.length)]
      if (to[0] === '?' || to[0] === '#') continue
      const url = read(to, 'de')
      const inside = url.pathname === '/de' || url.pathname.startsWith('/de/')
      if (url.host !== 'host.test' || !inside) expect.fail(`${JSON.stringify(to)} reads as ${url.href}`)
      if (read(to, 'en').host !== 'host.test') expect.fail(`${JSON.stringify(to)} leaves the origin`)
    }
  })
})

describe('withoutDots', () => {
  it.each([
    ['/a/b', '/a/b'],
    ['/a//b', '/a//b'],
    ['/.x//b', '/.x//b'],
    ['/a/./b', '/a/b'],
    ['/a/%2E/b/', '/a/b'],
    ['/a/b/../c', '/a/c'],
    ['/..\\b', '/b'],
    ['/a\\..\\..\\b', '/b'],
    ['/.\t./b', '/b'],
    ['/.\n./.\r./b', '/b'],
    ['/..\x01', '/'],
    ['/%2e%2e\\b', '/b'],
    ['/..%20/b', '/..%20/b'],
  ])('%j is %j', (path, plain) => {
    expect(withoutDots(path)).toBe(plain)
  })
})

describe('empty segments and dots, as a browser reads them', () => {
  it('a double slash is a segment that `..` removes', () => {
    expect(new URL('/a//../b', 'http://x').pathname).toBe('/a/b')
    expect(localizedPath('/a//../b', 'de', ['en', 'de'], 'en')).toBe('/de/a/b')
  })

  it('is linear on a run of blanks after a dot segment', () => {
    const started = performance.now()
    localizedPath(`/a/..${'/'.repeat(200_000)}`, 'de', ['en', 'de'], 'en')
    expect(performance.now() - started).toBeLessThan(500)
  })

  it('what stays never opens with two slashes', () => {
    for (const path of ['/p/..//host', '/a/..//host/x']) expect(localizedPath(path, 'de', ['en', 'de'], 'en')).toMatch(/^\/de\/[^/]/)
  })
})

describe('a route query with many repeats', () => {
  it('is linear', () => {
    const started = performance.now()
    routeQuery('a=1&'.repeat(40000))
    expect(performance.now() - started).toBeLessThan(500)
  })
})

describe('isSamePage', () => {
  it('a doubly encoded separator is another page', () => {
    expect(isSamePage('/a%252Fb', '/a%2Fb')).toBe(false)
  })
})
