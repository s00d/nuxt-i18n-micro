import type { I18nHeadObject } from '../src/merge-i18n-head'
import { mergeI18nHead } from '../src/merge-i18n-head'

const base: I18nHeadObject = {
  htmlAttrs: { lang: 'en-US', dir: 'ltr' },
  meta: [
    { id: 'i18n-og', property: 'og:locale', content: 'en_US' },
    { id: 'i18n-og-url', property: 'og:url', content: 'https://example.com/en/post' },
    { id: 'i18n-og-alt-fr_FR', property: 'og:locale:alternate', content: 'fr_FR' },
  ],
  link: [
    { id: 'i18n-can', rel: 'canonical', href: 'https://example.com/en/post' },
    { id: 'i18n-alternate-en', rel: 'alternate', hreflang: 'en', href: 'https://example.com/en/post' },
    { id: 'i18n-alternate-fr', rel: 'alternate', hreflang: 'fr', href: 'https://example.com/fr/post' },
    { id: 'i18n-xd', rel: 'alternate', hreflang: 'x-default', href: 'https://example.com/en/post' },
  ],
}

describe('mergeI18nHead', () => {
  it('returns a shallow copy when override is empty', () => {
    const result = mergeI18nHead(base, null)
    expect(result).toEqual(base)
    expect(result).not.toBe(base)
  })

  it('disables hreflang and x-default groups', () => {
    const result = mergeI18nHead(base, { disable: ['hreflang', 'x-default'] })
    expect(result.link.map((l) => l.hreflang)).toEqual([undefined])
    expect(result.link[0]?.rel).toBe('canonical')
  })

  it('replaces hreflang alternates', () => {
    const result = mergeI18nHead(base, {
      replace: {
        hreflang: [{ id: 'custom-en', rel: 'alternate', hreflang: 'en', href: 'https://example.com/en/custom' }],
      },
    })
    const alternates = result.link.filter((l) => l.rel === 'alternate')
    expect(alternates).toHaveLength(1)
    expect(alternates[0]?.href).toBe('https://example.com/en/custom')
  })

  it('appends meta with dedupe by property', () => {
    const result = mergeI18nHead(base, {
      meta: [
        { property: 'og:title', content: 'Hello' },
        { property: 'og:title', content: 'Updated' },
      ],
    })
    const ogTitle = result.meta.filter((m) => m.property === 'og:title')
    expect(ogTitle).toHaveLength(1)
    expect(ogTitle[0]?.content).toBe('Updated')
  })

  it('overrides built-in meta by property without id', () => {
    const result = mergeI18nHead(base, {
      meta: [{ property: 'og:url', content: 'https://example.com/custom-via-meta' }],
    })
    const ogUrl = result.meta.filter((m) => m.property === 'og:url')
    expect(ogUrl).toHaveLength(1)
    expect(ogUrl[0]?.content).toBe('https://example.com/custom-via-meta')
  })

  it('rebuilds og:locale:alternate from locale codes', () => {
    const result = mergeI18nHead(
      base,
      { replace: { ogAlternates: ['fr'] } },
      {
        locales: [
          { code: 'en', iso: 'en-US' },
          { code: 'fr', iso: 'fr-FR' },
        ],
        currentLocale: 'en',
      },
    )
    const alternates = result.meta.filter((m) => m.property === 'og:locale:alternate')
    expect(alternates).toHaveLength(1)
    expect(alternates[0]?.content).toBe('fr_FR')
  })

  it('replaces canonical href', () => {
    const result = mergeI18nHead(base, {
      replace: { canonical: 'https://example.com/en/custom-canonical' },
    })
    expect(result.link.find((l) => l.rel === 'canonical')?.href).toBe('https://example.com/en/custom-canonical')
  })

  it('clears html attrs when html group is disabled', () => {
    const result = mergeI18nHead(base, { disable: ['html'] })
    expect(result.htmlAttrs).toEqual({})
  })

  it('replaces x-default link', () => {
    const result = mergeI18nHead(base, {
      replace: {
        xDefault: {
          rel: 'alternate',
          hreflang: 'x-default',
          href: 'https://example.com/custom-default',
        },
      },
    })
    const xDefault = result.link.find((l) => l.hreflang === 'x-default')
    expect(xDefault?.href).toBe('https://example.com/custom-default')
  })

  it('replaces og:url and removes og:locale when false', () => {
    const withOgUrl = mergeI18nHead(base, {
      replace: { ogUrl: 'https://example.com/custom-og' },
    })
    expect(withOgUrl.meta.find((m) => m.property === 'og:url')?.content).toBe('https://example.com/custom-og')

    const withoutOg = mergeI18nHead(base, {
      replace: { ogLocale: false, ogUrl: false },
    })
    expect(withoutOg.meta.some((m) => m.property === 'og:locale')).toBe(false)
    expect(withoutOg.meta.some((m) => m.property === 'og:url')).toBe(false)
  })

  it('disables og and og-alternates groups', () => {
    const result = mergeI18nHead(base, { disable: ['og', 'og-alternates'] })
    expect(result.meta.some((m) => m.property?.startsWith('og:'))).toBe(false)
  })

  it('removes all alternates when hreflang replace is false', () => {
    const result = mergeI18nHead(base, { replace: { hreflang: false } })
    expect(result.link.every((l) => l.rel !== 'alternate')).toBe(true)
  })

  it('appends link with dedupe by rel and hreflang', () => {
    const result = mergeI18nHead(base, {
      link: [
        { rel: 'alternate', hreflang: 'en', href: 'https://example.com/en/updated' },
        { rel: 'alternate', hreflang: 'en', href: 'https://example.com/en/final' },
      ],
    })
    const enLinks = result.link.filter((l) => l.hreflang === 'en')
    expect(enLinks).toHaveLength(1)
    expect(enLinks[0]?.href).toBe('https://example.com/en/final')
  })

  it('merges htmlAttrs overrides', () => {
    const result = mergeI18nHead(base, {
      htmlAttrs: { lang: 'de-DE', 'data-page': 'article' },
    })
    expect(result.htmlAttrs).toEqual({ lang: 'de-DE', dir: 'ltr', 'data-page': 'article' })
  })

  it('disable hreflang keeps x-default unless disabled too', () => {
    const result = mergeI18nHead(base, { disable: ['hreflang'] })
    expect(result.link.some((l) => l.hreflang === 'en')).toBe(false)
    expect(result.link.some((l) => l.hreflang === 'fr')).toBe(false)
    expect(result.link.some((l) => l.hreflang === 'x-default')).toBe(true)
  })
})
