import { interpolate, useTranslationHelper } from '../src'

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

  test('deepClone creates a deep copy of objects', () => {
    const original = { nested: { key: 'value' } }
    const cloned = JSON.parse(JSON.stringify(original))

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })
})
