import { describe, expect, test } from 'vitest'
import { AstroI18n } from '../src/composer'

describe('AstroI18n.clone', () => {
  test('a request clone merges into its own storage; the global instance is untouched', () => {
    const global = new AstroI18n({ locale: 'en', messages: { en: { nav: { home: 'Home' } } }, missingWarn: false })
    const request = global.clone()
    request.mergeTranslations('en', 'index', { nav: { extra: 'X' } })
    expect(request.t('nav.extra')).toBe('X')
    expect(global.t('nav.extra')).toBe('nav.extra')
    expect(global.t('nav.home')).toBe('Home')
  })

  test('clearCache on a clone restores the initial messages', () => {
    const global = new AstroI18n({ locale: 'en', messages: { en: { hello: 'Hi' } }, missingWarn: false })
    const request = global.clone()
    request.addTranslations('en', { hello: 'Changed' })
    request.clearCache()
    expect(request.t('hello')).toBe('Hi')
  })
})
