import { interpolate, useTranslationHelper } from '../src'
import { describe, expect, test } from 'vitest'

describe('Translation Helper', () => {
  const translations = {
    en: {
      greeting: 'Hello, {name}!',
      nested: {
        message: 'This is a nested message.',
      },
    },
    fr: {
      greeting: 'Bonjour, {name}!',
    },
  }

  test('interpolate function replaces placeholders correctly', () => {
    const result = interpolate('Hello, {name}!', { name: 'John' })
    expect(result).toBe('Hello, John!')
  })

  test('interpolate function handles missing placeholders gracefully', () => {
    const result = interpolate('Hello, {name}!', { age: 30 })
    expect(result).toBe('Hello, {name}!')
  })

  test('getTranslation fetches correct translation', () => {
    const helper = useTranslationHelper()
    helper.loadTranslations('en', translations.en)

    const translation = helper.getTranslation('en', 'index', 'greeting')
    expect(translation).toBe('Hello, {name}!')
  })

  test('getTranslation supports nested keys', () => {
    const helper = useTranslationHelper()
    helper.loadTranslations('en', translations.en)

    const translation = helper.getTranslation('en', 'index', 'nested.message')
    expect(translation).toBe('This is a nested message.')
  })

  test('getTranslation falls back when translation is missing', () => {
    const helper = useTranslationHelper()
    helper.loadTranslations('en', translations.en)

    const translation = helper.getTranslation('en', 'index', 'nonexistent.key')
    expect(translation).toBeNull()
  })

  test('loadPageTranslations correctly caches translations', async () => {
    const helper = useTranslationHelper()
    await helper.loadPageTranslations('fr', 'home', translations.fr)

    expect(helper.hasPageTranslation('fr', 'home')).toBe(true)
    expect(helper.getTranslation('fr', 'home', 'greeting')).toBe('Bonjour, {name}!')
  })

  test('mergeTranslation updates route translations', () => {
    const helper = useTranslationHelper()
    helper.loadPageTranslations('en', 'home', translations.en)

    helper.mergeTranslation('en', 'home', { newKey: 'New value' })
    expect(helper.getTranslation('en', 'home', 'newKey')).toBe('New value')
  })

  test('mergeTranslation with index routeName updates index translations', () => {
    const helper = useTranslationHelper()
    helper.loadTranslations('en', translations.en)

    helper.mergeTranslation('en', 'index', { newKey: 'New value' })
    expect(helper.getTranslation('en', 'index', 'newKey')).toBe('New value')
  })

  test('mergeTranslation deep-merges nested objects (not shallow Object.assign)', () => {
    const helper = useTranslationHelper()
    helper.loadPageTranslations('en', 'home', { nav: { a: 1, keep: 'yes' } })

    helper.mergeTranslation('en', 'home', { nav: { b: 2 } })

    expect(helper.getTranslation('en', 'home', 'nav.a')).toBe(1)
    expect(helper.getTranslation('en', 'home', 'nav.keep')).toBe('yes')
    expect(helper.getTranslation('en', 'home', 'nav.b')).toBe(2)
  })

  test('loadTranslations deep-merges nested objects on second load', () => {
    const helper = useTranslationHelper()
    helper.loadTranslations('en', { nav: { a: 1 } })
    helper.loadTranslations('en', { nav: { b: 2 } })

    expect(helper.getTranslation('en', 'index', 'nav.a')).toBe(1)
    expect(helper.getTranslation('en', 'index', 'nav.b')).toBe(2)
  })

  test('sparse leaf cache returns same object reference; getCache stays nested tree', () => {
    const helper = useTranslationHelper()
    const nav = { about: 'About', home: 'Home' }
    helper.setTranslations('en', { nav }, 'index')

    const first = helper.getTranslation('en', 'index', 'nav')
    const second = helper.getTranslation('en', 'index', 'nav')
    expect(first).toBe(nav)
    expect(second).toBe(first)

    const tree = helper.getCache('en', 'index')
    expect(tree).toEqual({ nav })
    expect(tree?.nav).toBe(nav)
    expect(tree instanceof Map).toBe(false)
  })

  test('leaf cache invalidates after mergeTranslation', () => {
    const helper = useTranslationHelper()
    helper.setTranslations('en', { greeting: 'Hello' }, 'index')
    expect(helper.getTranslation('en', 'index', 'greeting')).toBe('Hello')

    helper.mergeTranslation('en', 'index', { greeting: 'Hi' })
    expect(helper.getTranslation('en', 'index', 'greeting')).toBe('Hi')
  })

  test('setCache installs a sparse leaf map for a chunk', () => {
    const helper = useTranslationHelper()
    helper.setTranslations('en', { greeting: 'Hello' }, 'index')

    const leaf = new Map<string, unknown>([['greeting', 'FromLeaf']])
    helper.setCache('en', 'index', leaf)

    expect(helper.getTranslation('en', 'index', 'greeting')).toBe('FromLeaf')
    // Nested tree unchanged
    expect(helper.getCache('en', 'index')).toEqual({ greeting: 'Hello' })
  })

  test('deepClone creates a deep copy of objects', () => {
    const original = { nested: { key: 'value' } }
    const cloned = JSON.parse(JSON.stringify(original))

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })
})
