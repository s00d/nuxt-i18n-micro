import { describe, expect, test } from 'vitest'
import { createI18n } from '../src'

describe('Node I18n public API', () => {
  test('locale switch updates t() output', () => {
    const i18n = createI18n({ locale: 'en' })
    i18n.addTranslations('en', { welcome: 'Welcome' })
    i18n.addTranslations('de', { welcome: 'Willkommen' })
    expect(i18n.t('welcome')).toBe('Welcome')
    i18n.locale = 'de'
    expect(i18n.t('welcome')).toBe('Willkommen')
  })
})
