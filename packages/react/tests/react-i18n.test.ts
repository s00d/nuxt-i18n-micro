import { describe, expect, test } from '@jest/globals'
import { createI18n, ReactI18n } from '../src/i18n'

describe('ReactI18n', () => {
  test('should create i18n instance', () => {
    const i18n = new ReactI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    expect(i18n.locale).toBe('en')
    expect(i18n.t('greeting')).toBe('Hello')
  })

  test('should translate with interpolation', () => {
    const i18n = new ReactI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello, {name}!',
        },
      },
    })

    expect(i18n.t('greeting', { name: 'John' })).toBe('Hello, John!')
  })

  test('should handle pluralization', () => {
    const i18n = new ReactI18n({
      locale: 'en',
      messages: {
        en: {
          apples: 'no apples | one apple | {count} apples',
        },
      },
    })

    expect(i18n.tc('apples', 0)).toBe('no apples')
    expect(i18n.tc('apples', 1)).toBe('one apple')
    expect(i18n.tc('apples', 5)).toBe('5 apples')
  })

  test('should format numbers', () => {
    const i18n = new ReactI18n({
      locale: 'en',
    })

    expect(i18n.tn(1234.56)).toMatch(/1[,.]234[.,]56/)
  })

  test('should format dates', () => {
    const i18n = new ReactI18n({
      locale: 'en',
    })

    const date = new Date('2023-01-15')
    const formatted = i18n.td(date)
    expect(formatted).toBeTruthy()
  })

  test('should format relative time', () => {
    const i18n = new ReactI18n({
      locale: 'en',
    })

    const oneHourAgo = new Date(Date.now() - 3600000)
    const formatted = i18n.tdr(oneHourAgo)
    expect(formatted).toMatch(/hour/)
  })

  test('should handle route-specific translations', () => {
    const i18n = new ReactI18n({
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

    i18n.setRoute('general')
    expect(i18n.t('title')).toBe('Global Title')
  })

  test('should fallback to fallbackLocale', () => {
    const i18n = new ReactI18n({
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
    const i18n = new ReactI18n({
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
    const i18n = new ReactI18n({
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
    const i18n = new ReactI18n({
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

  test('should return snapshot for useSyncExternalStore', () => {
    const i18n = new ReactI18n({
      locale: 'en',
    })

    const snapshot1 = i18n.getSnapshot()
    expect(typeof snapshot1).toBe('string')

    i18n.locale = 'fr'
    const snapshot2 = i18n.getSnapshot()
    expect(snapshot2).not.toBe(snapshot1)
  })

  test('should check translation existence', () => {
    const i18n = new ReactI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    expect(i18n.has('greeting')).toBe(true)
    expect(i18n.has('missing')).toBe(false)
  })

  test('should clear cache', () => {
    const i18n = new ReactI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    let notified = false
    const unsubscribe = i18n.subscribe(() => {
      notified = true
    })

    i18n.clearCache()
    expect(notified).toBe(true)

    unsubscribe()
  })
})

describe('createI18n function', () => {
  test('should create i18n instance', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    expect(i18n).toBeInstanceOf(ReactI18n)
    expect(i18n.t('greeting')).toBe('Hello')
  })
})
