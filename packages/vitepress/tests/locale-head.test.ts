import { describe, expect, it } from 'vitest'
import { buildVitePressLocaleHead, relativePathToRoutePath } from '../src/seo/locale-head'

describe('relativePathToRoutePath', () => {
  it('maps md paths to cleanUrls routes', () => {
    expect(relativePathToRoutePath('index.md')).toBe('/')
    expect(relativePathToRoutePath('guide/demo.md')).toBe('/guide/demo')
    expect(relativePathToRoutePath('fr/index.md')).toBe('/fr')
    expect(relativePathToRoutePath('fr/guide/demo.md')).toBe('/fr/guide/demo')
  })
})

describe('buildVitePressLocaleHead', () => {
  const locales = [
    { code: 'en', iso: 'en-US', displayName: 'English', og: 'en_US' },
    { code: 'fr', iso: 'fr-FR', displayName: 'Français', og: 'fr_FR' },
  ]

  it('emits only htmlAttrs without metaBaseUrl', () => {
    const built = buildVitePressLocaleHead({
      path: '/fr/guide',
      locales,
      defaultLocale: 'en',
    })
    expect(built.htmlAttrs.lang).toBe('fr-FR')
    expect(built.htmlAttrs.dir).toBe('auto')
    expect(built.head).toEqual([])
  })

  it('emits canonical, hreflang, x-default and og tags', () => {
    const built = buildVitePressLocaleHead({
      path: '/docs/fr/guide',
      locales,
      defaultLocale: 'en',
      base: '/docs/',
      metaBaseUrl: 'https://example.com',
    })

    const byRel = built.head.filter((t) => t[0] === 'link')
    const canonical = byRel.find((t) => t[1].rel === 'canonical')
    expect(canonical?.[1].href).toBe('https://example.com/docs/fr/guide')

    const alternates = byRel.filter((t) => t[1].rel === 'alternate')
    expect(alternates.some((t) => t[1].hreflang === 'en-US' && t[1].href === 'https://example.com/docs/guide')).toBe(true)
    expect(alternates.some((t) => t[1].hreflang === 'fr-FR' && t[1].href === 'https://example.com/docs/fr/guide')).toBe(true)
    expect(alternates.some((t) => t[1].hreflang === 'x-default' && t[1].href === 'https://example.com/docs/guide')).toBe(true)

    const ogLocale = built.head.find((t) => t[0] === 'meta' && t[1].property === 'og:locale')
    expect(ogLocale?.[1].content).toBe('fr_FR')
    const ogUrl = built.head.find((t) => t[0] === 'meta' && t[1].property === 'og:url')
    expect(ogUrl?.[1].content).toBe('https://example.com/docs/fr/guide')
  })
})
