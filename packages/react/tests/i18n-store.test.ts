/**
 * Characterization tests for the reactive store surface of ReactI18n
 * (subscribe / getSnapshot / notify semantics). These pin the exact current
 * behavior so the store internals can be refactored safely.
 */
import { describe, expect, test, vi } from 'vitest'
import { createI18n, ReactI18n } from '../src/i18n'

const make = () =>
  createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en: { greeting: 'Hello', nested: { key: 'value' } },
      de: { greeting: 'Hallo' },
    },
  })

describe('ReactI18n reactive store', () => {
  test('createI18n returns a ReactI18n instance', () => {
    expect(make()).toBeInstanceOf(ReactI18n)
  })

  test('subscribe returns an unsubscribe function', () => {
    const i18n = make()
    const listener = vi.fn()
    const unsubscribe = i18n.subscribe(listener)
    i18n.locale = 'de'
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    i18n.locale = 'en'
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test('setting the same locale does not notify', () => {
    const i18n = make()
    const listener = vi.fn()
    i18n.subscribe(listener)
    i18n.locale = 'en'
    expect(listener).not.toHaveBeenCalled()
  })

  test('getSnapshot changes on locale change, route change and translation load', () => {
    const i18n = make()
    const s0 = i18n.getSnapshot()

    i18n.locale = 'de'
    const s1 = i18n.getSnapshot()
    expect(s1).not.toBe(s0)

    i18n.setRoute('about')
    const s2 = i18n.getSnapshot()
    expect(s2).not.toBe(s1)

    i18n.addTranslations('de', { extra: 'mehr' })
    const s3 = i18n.getSnapshot()
    expect(s3).not.toBe(s2)
  })

  test('setRoute notifies only when route actually changes', () => {
    const i18n = make()
    const listener = vi.fn()
    i18n.subscribe(listener)
    i18n.setRoute('index')
    expect(listener).not.toHaveBeenCalled()
    i18n.setRoute('about')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(i18n.getRoute()).toBe('about')
    expect(i18n.currentRoute).toBe('about')
  })

  test('addTranslations merges and notifies', () => {
    const i18n = make()
    const listener = vi.fn()
    i18n.subscribe(listener)
    i18n.addTranslations('en', { farewell: 'Bye' })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(i18n.t('farewell')).toBe('Bye')
    expect(i18n.t('greeting')).toBe('Hello')
  })

  test('addRouteTranslations scopes translations to the route', () => {
    const i18n = make()
    i18n.addRouteTranslations('en', 'about', { title: 'About us' })
    i18n.setRoute('about')
    expect(i18n.t('title')).toBe('About us')
    // Global messages remain available on route-scoped pages (key fallback when missing on route)
    expect(i18n.t('greeting')).toBe('greeting')
  })

  test('clearCache notifies subscribers', () => {
    const i18n = make()
    const listener = vi.fn()
    i18n.subscribe(listener)
    i18n.clearCache()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test('fallbackLocale setter notifies on change (and not on same value)', () => {
    const i18n = make()
    const listener = vi.fn()
    i18n.subscribe(listener)
    i18n.fallbackLocale = 'de'
    expect(listener).toHaveBeenCalledTimes(1)
    expect(i18n.getFallbackLocale()).toBe('de')
    // no notification when the value is unchanged
    i18n.fallbackLocale = 'de'
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test('locale switch changes translation resolution', () => {
    const i18n = make()
    expect(i18n.t('greeting')).toBe('Hello')
    i18n.locale = 'de'
    expect(i18n.t('greeting')).toBe('Hallo')
    expect(i18n.getLocale()).toBe('de')
  })
})
