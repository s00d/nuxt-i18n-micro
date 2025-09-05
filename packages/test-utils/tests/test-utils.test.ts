import { i18nUtils } from '../src'

describe('i18nUtils', () => {
  const mockTranslations = {
    greeting: 'Hello, {name}!',
    nested: {
      message: 'Nested message here.',
    },
    plural: 'One item|{count} items',
  }

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    i18nUtils.setLocale('en')
    await i18nUtils.setTranslationsFromJson('en', mockTranslations)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('t function returns correct translation', () => {
    const result = i18nUtils.t('greeting', { name: 'John' })
    expect(result).toBe('Hello, John!')
  })

  test('t function returns key if translation is missing', () => {
    const result = i18nUtils.t('missing.key', {}, 'Default value')
    expect(result).toBe('Default value')
  })

  test('tc function handles plural translations', () => {
    const singular = i18nUtils.tc('plural', 1)
    const plural = i18nUtils.tc('plural', 5)

    expect(singular).toBe('1 items')
    expect(plural).toBe('5 items')
  })

  test('mergeTranslations updates translations', () => {
    i18nUtils.mergeTranslations({ newKey: 'New value' })

    const result = i18nUtils.t('newKey')
    expect(result).toBe('New value')
  })

  test('tn formats numbers correctly', () => {
    const formatted = i18nUtils.tn(123456.789, { style: 'currency', currency: 'USD' })
    expect(formatted).toBe('$123,456.79')
  })

  test('td formats dates correctly', () => {
    const date = new Date('2023-12-01T00:00:00Z')
    const formatted = i18nUtils.td(date, { year: 'numeric', month: 'long', day: 'numeric' })

    expect(formatted).toBe('December 1, 2023') // Depends on locale
  })

  test('setLocale changes the current locale', () => {
    i18nUtils.setLocale('fr')
    expect(i18nUtils.getLocale()).toBe('fr')
  })

  test('getLocaleName returns the current locale name', () => {
    expect(i18nUtils.getLocaleName()).toBe('English')
  })

  test('has checks if translation key exists', () => {
    expect(i18nUtils.has('greeting')).toBe(true)
    expect(i18nUtils.has('missing.key')).toBe(false)
  })

  test('switchLocale updates the locale', () => {
    i18nUtils.switchLocale('fr')
    expect(i18nUtils.getLocale()).toBe('fr')
  })

  test('localePath and localeRoute return empty strings by default', () => {
    expect(i18nUtils.localePath('someRoute')).toBe('')
    expect(i18nUtils.localeRoute('someRoute')).toBeUndefined()
  })
})
