import { describe, expect, test, vi } from 'vitest'
import { VueI18n } from '../src/composer'

describe('VueI18n reactive surface', () => {
  test('subscribeToChanges notifies on locale update', () => {
    const i18n = new VueI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: { en: { hello: 'Hello' } },
    })
    const listener = vi.fn()
    const unsubscribe = i18n.subscribeToChanges(listener)
    i18n.addTranslations('de', { hello: 'Hallo' })
    i18n.locale = 'de'
    expect(listener).toHaveBeenCalled()
    unsubscribe()
  })
})
