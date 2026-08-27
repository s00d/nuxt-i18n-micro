import type { AstroGlobal } from 'astro'
import { describe, expect, test } from 'vitest'
import { AstroI18n } from '../src/composer'
import { getLocaleRewritePath, prepareLocaleRewrite } from '../src/utils'

function createAstro(partial: Partial<AstroGlobal> & { params?: Record<string, string | undefined> }): AstroGlobal {
  const i18n = new AstroI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en: { greeting: 'Hello' } },
  })

  return {
    params: partial.params ?? {},
    url: partial.url ?? new URL('http://localhost/en/about'),
    locals: {
      i18n,
      locale: 'en',
      defaultLocale: 'en',
      locales: [
        { code: 'en', displayName: 'English' },
        { code: 'fr', displayName: 'Français' },
      ],
      currentUrl: partial.locals?.currentUrl ?? new URL('http://localhost/en/about'),
      ...partial.locals,
    },
  } as AstroGlobal
}

describe('locale rewrite helpers', () => {
  test('getLocaleRewritePath strips locale prefix from currentUrl', () => {
    const astro = createAstro({
      locals: {
        currentUrl: new URL('http://localhost/fr/components'),
      },
    })

    expect(getLocaleRewritePath(astro)).toBe('/components')
  })

  test('prepareLocaleRewrite returns 404 for unknown locale', () => {
    const result = prepareLocaleRewrite(createAstro({ params: { locale: 'xx' } }))
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(404)
  })

  test('prepareLocaleRewrite syncs locale and returns rewrite path', () => {
    const astro = createAstro({
      params: { locale: 'fr' },
      locals: {
        currentUrl: new URL('http://localhost/fr/about'),
      },
    })

    const result = prepareLocaleRewrite(astro)
    expect(result).toBe('/about')
    expect(astro.locals.locale).toBe('fr')
    expect(astro.locals.i18n?.locale).toBe('fr')
  })
})
