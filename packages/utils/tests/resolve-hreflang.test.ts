import { resolveHreflangAlternates } from '../src/resolve-hreflang'
import { describe, expect, it } from 'vitest'

/** Issue #243 market locales: `code` is a routing/region key, `iso` is the language tag. */
const marketLocales = [
  { code: 'en', iso: 'en-US' },
  { code: 'es', iso: 'es-ES' },
  { code: 'mx', iso: 'es-MX' },
] as const

describe('resolveHreflangAlternates (#243)', () => {
  it('emits one tag per locale from iso when set — never routing code', () => {
    const hreflangs = resolveHreflangAlternates([...marketLocales]).map((t) => t.hreflang)

    expect(hreflangs).toEqual(['en-US', 'es-ES', 'es-MX'])
    expect(hreflangs).not.toContain('mx')
    expect(hreflangs).not.toContain('en')
    expect(hreflangs).not.toContain('es')
  })

  it('falls back to code when iso is absent', () => {
    const hreflangs = resolveHreflangAlternates([{ code: 'en' }, { code: 'de' }]).map((t) => t.hreflang)

    expect(hreflangs).toEqual(['en', 'de'])
  })

  it('emits one tag when iso equals code, with or without the bare language', () => {
    const plain = resolveHreflangAlternates([{ code: 'en-US', iso: 'en-US' }])
    const withBase = resolveHreflangAlternates([{ code: 'en-US', iso: 'en-US' }], { hreflangBaseLanguage: true })

    expect(plain.map((t) => t.hreflang)).toEqual(['en-US'])
    expect(withBase.map((t) => t.hreflang)).toEqual(['en', 'en-US'])
    // two locales sharing one tag still produce it once
    expect(
      resolveHreflangAlternates(
        [
          { code: 'a', iso: 'de' },
          { code: 'b', iso: 'de' },
        ],
        { hreflangBaseLanguage: true },
      ),
    ).toEqual([{ hreflang: 'de', localeCode: 'a' }])
  })

  it('the first regional locale in the list claims the bare language tag', () => {
    const tags = resolveHreflangAlternates(
      [
        { code: 'mx', iso: 'es-MX' },
        { code: 'es', iso: 'es-ES' },
      ],
      { hreflangBaseLanguage: true },
    )

    expect(tags).toEqual([
      { hreflang: 'es', localeCode: 'mx' },
      { hreflang: 'es-MX', localeCode: 'mx' },
      { hreflang: 'es-ES', localeCode: 'es' },
    ])
  })

  it('opt-in bare language is derived from iso, not code', () => {
    const hreflangs = resolveHreflangAlternates([...marketLocales], { hreflangBaseLanguage: true }).map((t) => t.hreflang)

    expect(hreflangs).toEqual(['en', 'en-US', 'es', 'es-ES', 'es-MX'])
    expect(hreflangs).not.toContain('mx')
  })
})
