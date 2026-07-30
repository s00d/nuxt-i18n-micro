import { describe, expect, it } from 'vitest'
import { RAW_KEY } from '../src/commands/smoke-verify'

/**
 * This regex is the smoke check's only defence against a page that renders raw keys.
 * If it stopped matching, every deployment would verify green — so it gets a test.
 */
describe('RAW_KEY', () => {
  it('matches a bare dotted key rendered as text', () => {
    expect(RAW_KEY.test('<h1>page.index.title</h1>')).toBe(true)
    expect(RAW_KEY.test('<p class="lead">home.subtitle</p>')).toBe(true)
    expect(RAW_KEY.test('<a href="/de">nav.about</a>')).toBe(true)
    expect(RAW_KEY.test('<h1>\n  page.index.title\n</h1>')).toBe(true)
  })

  it('does not match real translated copy', () => {
    expect(RAW_KEY.test('<h1>Welcome home</h1>')).toBe(false)
    expect(RAW_KEY.test('<p>Willkommen bei nuxt-i18n-micro.</p>')).toBe(false)
    // A sentence that merely contains a dot is not a key.
    expect(RAW_KEY.test('<p>Version 3.21.4 is out.</p>')).toBe(false)
  })
})
