import type { Locale } from '@i18n-micro/types'
import { describe, expect, it } from 'vitest'
import { buildLocaleHead, filterQuery, joinBase } from '../src/locale-head'

const en: Locale = { code: 'en', iso: 'en-US' }
const de: Locale = { code: 'de', iso: 'de-DE', dir: 'ltr' }

describe('joinBase', () => {
  it.each([
    ['/', '/de', '/de'],
    ['/', '/', '/'],
    ['https://x.com', '/de', 'https://x.com/de'],
    ['https://x.com/', '/de', 'https://x.com/de'],
    ['https://x.com/', 'de', 'https://x.com/de'],
    ['/docs/', '/fr/guide', '/docs/fr/guide'],
  ])('%s + %s', (base, path, joined) => {
    expect(joinBase(base, path)).toBe(joined)
  })
})

describe('filterQuery', () => {
  it.each([
    ['/a', ['q'], '/a'],
    ['/a?q=1&z=2', ['q'], '/a?q=1'],
    ['/a?q=1#h', ['q'], '/a?q=1'],
    ['/a?z=2', ['q'], '/a'],
    ['/a#h', ['q'], '/a'],
    ['/a?q=1', [], '/a'],
    ['?q=1', ['q'], '/?q=1'],
    ['https://x.com/a?q=1&z=2', ['q'], 'https://x.com/a?q=1'],
    ['/a?h=1#?q=2', ['q'], '/a'],
  ])('%s keeping %j', (url, whitelist, kept) => {
    expect(filterQuery(url, whitelist)).toBe(kept)
  })
})

describe('buildLocaleHead', () => {
  const base = { locale: en, seoLocales: [en, de], hrefOf: (code: string) => `/${code}`, canonical: '/en', xDefault: '/en' }

  it('emits canonical, hreflang, x-default and og tags', () => {
    expect(buildLocaleHead(base)).toEqual({
      htmlAttrs: { lang: 'en-US', dir: 'auto' },
      meta: [
        { id: 'i18n-og', property: 'og:locale', content: 'en_US' },
        { id: 'i18n-og-url', property: 'og:url', content: '/en' },
        { id: 'i18n-og-alt-de_DE', property: 'og:locale:alternate', content: 'de_DE' },
      ],
      link: [
        { id: 'i18n-can', rel: 'canonical', href: '/en' },
        { id: 'i18n-alternate-en-US', rel: 'alternate', href: '/en', hreflang: 'en-US' },
        { id: 'i18n-alternate-de-DE', rel: 'alternate', href: '/de', hreflang: 'de-DE' },
        { id: 'i18n-xd', rel: 'alternate', href: '/en', hreflang: 'x-default' },
      ],
    })
  })

  it('stops at htmlAttrs without SEO tags', () => {
    expect(buildLocaleHead({ ...base, addSeoAttributes: false, addDirAttribute: false })).toEqual({
      htmlAttrs: { lang: 'en-US' },
      link: [],
      meta: [],
    })
  })

  it('skips a locale without a URL, x-default without one, and hreflang under one URL per page', () => {
    const noDe = buildLocaleHead({ ...base, hrefOf: (code) => (code === 'de' ? '' : `/${code}`), xDefault: undefined })
    expect(noDe.link.map((link) => link.hreflang)).toEqual([undefined, 'en-US'])
    expect(buildLocaleHead({ ...base, alternates: false, xDefault: undefined }).link.map((link) => link.rel)).toEqual(['canonical'])
  })

  it('names the tags by the identifier attribute', () => {
    expect(buildLocaleHead({ ...base, identifierAttribute: 'key' }).link[0]).toEqual({ key: 'i18n-can', rel: 'canonical', href: '/en' })
  })
})
