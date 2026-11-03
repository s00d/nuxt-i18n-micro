import { externalLinkHref } from '@i18n-micro/core'
import { describe, expect, it } from 'vitest'
import { localizeHref } from '../src/request'
import { createAstroRouterAdapter, type I18nRoutingStrategy } from '../src'

const context = (from: string) => ({
  base: '',
  defaultLocale: 'en',
  codes: ['en', 'de'],
  from,
  strategy: { localizePath: (path: string) => path } as unknown as I18nRoutingStrategy,
})

describe('localizeHref, a request path of slashes', () => {
  it('stays linear on a run that does not reach the end', () => {
    const from = `${'/'.repeat(1 << 16)}x`
    const start = performance.now()
    localizeHref('a', 'de', context(from))
    expect(performance.now() - start).toBeLessThan(500)
  })
})

describe('localizeHref, a link out of the locale prefix', () => {
  const locales = [{ code: 'en' }, { code: 'de' }]
  const strategy = createAstroRouterAdapter(locales, 'en')
  const href = (to: string, from = '/de/page') => localizeHref(to, 'de', { base: '', defaultLocale: 'en', codes: ['en', 'de'], strategy, from })

  it.each([
    ['/..\\b', '/de/b'],
    ['/a\\..\\..\\b', '/de/b'],
    ['/.\t./b', '/de/b'],
    ['/.\n./.\r./b', '/de/b'],
    ['/%2e%2e\\b', '/de/b'],
    ['/../../b', '/de/b'],
  ])('%j is %s', (to, path) => {
    expect(href(to)).toBe(path)
  })

  it('stays under the prefix, on any string', () => {
    let seed = 11
    const next = (n: number) => ((seed = (seed * 1664525 + 1013904223) >>> 0) >>> 8) % n
    const atoms = ['/', '/', '\\', '.', '..', '%2e', '%2E', '\t', '\n', '\r', ' ', '\x01', '\xa0', 'x', 'y', 'de', '%2f', '%5c']
    for (let i = 0; i < 100_000; i++) {
      let to = next(3) === 0 ? '' : '/'
      for (let n = next(8); n >= 0; n--) to += atoms[next(atoms.length)]
      if (externalLinkHref(to)) continue
      const url = new URL(href(to), 'https://host.test/')
      const inside = url.pathname === '/de' || url.pathname.startsWith('/de/')
      if (url.host !== 'host.test' || !inside) expect.fail(`${JSON.stringify(to)} reads as ${url.href}`)
    }
  })
})
