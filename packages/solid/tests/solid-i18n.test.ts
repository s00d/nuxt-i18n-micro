import { describe, expect, test } from 'vitest'
import { createI18n, SolidI18n } from '../src/i18n'

describe('SolidI18n', () => {
  test('should handle route-specific translations', () => {
    const i18n = new SolidI18n({
      locale: 'en',
      messages: {
        en: {
          title: 'Global Title',
        },
      },
    })

    i18n.addRouteTranslations(
      'en',
      'home',
      {
        title: 'Home Title',
      },
      false,
    )

    i18n.setRoute('home')
    expect(i18n.t('title')).toBe('Home Title')

    i18n.setRoute('index')
    expect(i18n.t('title')).toBe('Global Title')
  })

  test('should fallback to fallbackLocale', () => {
    const i18n = new SolidI18n({
      locale: 'fr',
      fallbackLocale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    expect(i18n.t('greeting')).toBe('Hello')
  })

  test('should notify subscribers on locale change', () => {
    const i18n = new SolidI18n({
      locale: 'en',
    })

    let notified = false
    const unsubscribe = i18n.subscribe(() => {
      notified = true
    })

    i18n.locale = 'fr'
    expect(notified).toBe(true)

    unsubscribe()
  })

  test('should notify subscribers on route change', () => {
    const i18n = new SolidI18n({
      locale: 'en',
    })

    let notified = false
    const unsubscribe = i18n.subscribe(() => {
      notified = true
    })

    i18n.setRoute('home')
    expect(notified).toBe(true)

    unsubscribe()
  })

  test('should notify subscribers on translation addition', () => {
    const i18n = new SolidI18n({
      locale: 'en',
    })

    let notified = false
    const unsubscribe = i18n.subscribe(() => {
      notified = true
    })

    i18n.addTranslations('en', { newKey: 'New Value' }, false)
    expect(notified).toBe(true)

    unsubscribe()
  })
})
