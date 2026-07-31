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

  it('does not duplicate when iso equals code', () => {
    const hreflangs = resolveHreflangAlternates([{ code: 'en-US', iso: 'en-US' }]).map((t) => t.hreflang)

    expect(hreflangs).toEqual(['en-US'])
  })

  it('opt-in bare language is derived from iso, not code', () => {
    const hreflangs = resolveHreflangAlternates([...marketLocales], { hreflangBaseLanguage: true }).map((t) => t.hreflang)

    expect(hreflangs).toEqual(['en', 'en-US', 'es', 'es-ES', 'es-MX'])
    expect(hreflangs).not.toContain('mx')
  })

  it('first regional locale in list claims the bare language tag', () => {
    const tags = resolveHreflangAlternates(
      [
        { code: 'es', iso: 'es-ES' },
        { code: 'mx', iso: 'es-MX' },
      ],
      { hreflangBaseLanguage: true },
    )

    expect(tags.map((t) => t.hreflang)).toEqual(['es', 'es-ES', 'es-MX'])
    expect(tags.find((t) => t.hreflang === 'es')?.localeCode).toBe('es')
  })
})
