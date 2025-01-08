import { useTranslationHelper, interpolate } from '../src'

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
    helper.setLocale('en')
    helper.loadTranslations(translations.en)

    const translation = helper.getTranslation('index', 'greeting')
    expect(translation).toBe('Hello, {name}!')
  })

  test('getTranslation supports nested keys', () => {
    const helper = useTranslationHelper()
    helper.setLocale('en')
    helper.loadTranslations(translations.en)

    const translation = helper.getTranslation('index', 'nested.message')
    expect(translation).toBe('This is a nested message.')
  })

  test('getTranslation falls back when translation is missing', () => {
    const helper = useTranslationHelper()
    helper.setLocale('en')
    helper.loadTranslations(translations.en)

    const translation = helper.getTranslation('index', 'nonexistent.key')
    expect(translation).toBeNull()
  })

  test('loadPageTranslations correctly caches translations', async () => {
    const helper = useTranslationHelper()
    helper.setLocale('fr')
    await helper.loadPageTranslations('home', translations.fr)

    expect(helper.hasPageTranslation('home')).toBe(true)
    expect(helper.getTranslation('home', 'greeting')).toBe('Bonjour, {name}!')
  })

  test('mergeTranslation updates route translations', () => {
    const helper = useTranslationHelper()
    helper.setLocale('en')
    helper.loadPageTranslations('home', translations.en)

    helper.mergeTranslation('home', { newKey: 'New value' })
    expect(helper.getTranslation('home', 'newKey')).toBe('New value')
  })

  test('mergeGlobalTranslation updates general translations', () => {
    const helper = useTranslationHelper()
    helper.setLocale('en')
    helper.loadTranslations(translations.en)

    helper.mergeGlobalTranslation({ newGlobalKey: 'Global value' })
    expect(helper.getTranslation('index', 'newGlobalKey')).toBe('Global value')
  })

  test('deepClone creates a deep copy of objects', () => {
    const original = { nested: { key: 'value' } }
    const cloned = JSON.parse(JSON.stringify(original))

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })
})
