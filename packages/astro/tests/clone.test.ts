import { describe, expect, test } from 'vitest'
import { AstroI18n } from '../src/composer'

describe('AstroI18n.clone', () => {
  test('clearCache on a clone restores the initial messages', () => {
    const global = new AstroI18n({ locale: 'en', messages: { en: { hello: 'Hi' } }, missingWarn: false })
    const request = global.clone()
    request.addTranslations('en', { hello: 'Changed' })
    request.clearCache()
    expect(request.t('hello')).toBe('Hi')
  })
})
