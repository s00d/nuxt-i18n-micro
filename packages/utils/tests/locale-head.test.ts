import type { Locale } from '@i18n-micro/types'
import { describe, expect, it } from 'vitest'
import { buildLocaleHead, filterQuery, joinBase, queryString } from '../src/locale-head'

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
    ['/', '//evil.example/x', '/evil.example/x'],
    ['https://x.com', '//evil.example', 'https://x.com/evil.example'],
    ['/', '/\\evil.example', '/evil.example'],
    ['/', '\\\\evil.example', '/evil.example'],
    ['/', '/\t/evil.example', '/evil.example'],
    ['/', '/\n\\evil.example', '/evil.example'],
  ])('%s + %s', (base, path, joined) => {
    expect(joinBase(base, path)).toBe(joined)
  })

  it('is linear on a base of slashes that stops short of the end', () => {
    const start = performance.now()
    joinBase(`/x${'/'.repeat(1 << 17)}y`, '/de')
    expect(performance.now() - start).toBeLessThan(200)
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
    ['/x?tag=a&tag=b', ['tag'], '/x?tag=a&tag=b'],
    ['/x?z=1&tag=a&q=2&tag=b', ['q', 'tag'], '/x?q=2&tag=a&tag=b'],
    ['/x?tag=a', ['tag', 'tag'], '/x?tag=a'],
    ['/x?flag', ['flag'], '/x?flag'],
    ['/x?flag=', ['flag'], '/x?flag='],
    ['/x?q=a%20b', ['q'], '/x?q=a+b'],
  ])('%s keeping %j', (url, whitelist, kept) => {
    expect(filterQuery(url, whitelist)).toBe(kept)
  })
})

describe('queryString', () => {
  it.each([
    [undefined, ''],
    [{}, ''],
    [{ a: '1' }, '?a=1'],
    [{ a: 1, b: true }, '?a=1&b=true'],
    [{ a: ['1', '2'] }, '?a=1&a=2'],
    [{ a: undefined, b: '2' }, '?b=2'],
    [{ a: null }, '?a'],
    [{ a: [null, '2'] }, '?a&a=2'],
    [{ 'a b': null }, '?a+b'],
    [{ a: '' }, '?a='],
    [{ q: 'a b&c' }, '?q=a+b%26c'],
  ])('%j', (query, serialized) => {
    expect(queryString(query)).toBe(serialized)
  })
})

describe('buildLocaleHead', () => {
  const base = { locale: en, seoLocales: [en, de], hrefOf: (code: string) => `/${code}`, canonical: '/en', xDefault: '/en' }

  it('emits canonical, hreflang, x-default and og tags', () => {
    expect(buildLocaleHead(base)).toEqual({
      htmlAttrs: { lang: 'en-US' },
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

  it.each([
    [{ code: 'en', iso: 'en-US' }, undefined],
    [{ code: 'tr' }, undefined],
    [{ code: 'arn' }, undefined],
    [{ code: 'ar' }, 'rtl'],
    [{ code: 'x', iso: 'ar-SA' }, 'rtl'],
    [{ code: 'x', iso: 'ar_AE' }, 'rtl'],
    [{ code: 'he' }, 'rtl'],
    [{ code: 'fa-IR' }, 'rtl'],
    [{ code: 'ur', iso: 'ur-PK' }, 'rtl'],
    [{ code: 'az-Arab' }, 'rtl'],
    [{ code: 'pa-Arab-PK' }, 'rtl'],
    [{ code: 'ar-Latn' }, undefined],
    [{ code: 'en-u-arab' }, undefined],
    [{ code: 'ar-u-latn' }, 'rtl'],
    [{ code: 'zh-cmn-Hans' }, undefined],
    [{ code: 'ar-aao-Latn' }, undefined],
    ...['ks', 'rhg', 'sdh', 'bal', 'skr', 'pnb', 'arz', 'ary'].map((code) => [{ code }, 'rtl']),
    [{ code: 'az-Latn' }, undefined],
    // an extension names no script
    ...['ar-u-nu-latn', 'ar-EG-u-nu-latn', 'fa-u-nu-latn'].map((code) => [{ code }, 'rtl']),
    ...['en-u-nu-arab', 'en-u-ca-hebr', 'en-x-arab'].map((code) => [{ code }, undefined]),
    // the region decides the script
    ...['az-IR', 'pa-PK', 'uz-AF', 'ku-IQ', 'ku-IR', 'ha-SD', 'ms-CC'].map((code) => [{ code }, 'rtl']),
    ...['az', 'pa', 'uz', 'ku', 'ha', 'ms', 'sd-IN'].map((code) => [{ code }, undefined]),
    // no table lists these
    ...['aeb', 'arq', 'prs', 'bej', 'kas', 'ota'].map((code) => [{ code }, 'rtl']),
    // an extlang adds nothing to the language
    [{ code: 'ar-aao' }, 'rtl'],
    [{ code: 'zh-cmn' }, undefined],
    // no language tag at all
    ...['ar-', 'ar_', 'fa-'].map((code) => [{ code }, undefined]),
    [{ code: 'ar', dir: 'ltr' }, 'ltr'],
    [{ code: 'en', dir: 'rtl' }, 'rtl'],
    [{ code: 'en', dir: 'auto' }, 'auto'],
  ] as [Locale, string | undefined][])('dir of %j is %s', (locale, dir) => {
    expect(buildLocaleHead({ ...base, locale }).htmlAttrs.dir).toBe(dir)
    expect('dir' in buildLocaleHead({ ...base, locale }).htmlAttrs).toBe(dir !== undefined)
  })

  it('no dir at all when it is not asked for', () => {
    expect(buildLocaleHead({ ...base, locale: { code: 'ar', dir: 'rtl' }, addDirAttribute: false }).htmlAttrs).toEqual({ lang: 'ar' })
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
    expect(buildLocaleHead({ ...base, alternates: false }).link.map((link) => link.rel)).toEqual(['canonical'])
  })

  it('names the tags by the identifier attribute', () => {
    expect(buildLocaleHead({ ...base, identifierAttribute: 'key' }).link[0]).toEqual({ key: 'i18n-can', rel: 'canonical', href: '/en' })
  })
})
