/**
 * Characterization tests for PreactI18n reactive store (subscribe / getSnapshot).
 */
import { describe, expect, test, vi } from 'vitest'
import { createI18n, PreactI18n } from '../src/i18n'

const make = () =>
  createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en: { greeting: 'Hello' },
      de: { greeting: 'Hallo' },
    },
  })

describe('PreactI18n reactive store', () => {
  test('createI18n returns a PreactI18n instance', () => {
    expect(make()).toBeInstanceOf(PreactI18n)
  })

  test('subscribe notifies on locale change', () => {
    const i18n = make()
    const listener = vi.fn()
    const unsubscribe = i18n.subscribe(listener)
    i18n.locale = 'de'
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    i18n.locale = 'en'
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test('getSnapshot changes when locale changes', () => {
    const i18n = make()
    const s0 = i18n.getSnapshot()
    i18n.locale = 'de'
    expect(i18n.getSnapshot()).not.toBe(s0)
  })
})
