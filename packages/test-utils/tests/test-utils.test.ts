import { createFakeI18n, i18nUtils, resetI18n } from '../src'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('i18nUtils', () => {
  const mockTranslations = {
    greeting: 'Hello, {name}!',
    nested: {
      message: 'Nested message here.',
    },
    plural: 'One item|{count} items',
  }

  beforeEach(async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    resetI18n()
    await i18nUtils.setTranslationsFromJson('en', mockTranslations)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

  test('resolveTranslations returns the active translation tree', () => {
    expect(i18nUtils.resolveTranslations()).toEqual(mockTranslations)
  })

  test('setTranslation replaces a value by key', () => {
    i18nUtils.setTranslation('aaa', { fff: 'ggg' })
    i18nUtils.setTranslation('nested', 'flat')

    expect(i18nUtils.resolveTranslations()).toEqual({
      greeting: 'Hello, {name}!',
      aaa: { fff: 'ggg' },
      nested: 'flat',
      plural: 'One item|{count} items',
    })
    expect(i18nUtils.t('aaa.fff')).toBe('ggg')
    expect(i18nUtils.t('nested')).toBe('flat')
  })

  test('tn formats numbers correctly', () => {
    const formatted = i18nUtils.tn(123456.789, { style: 'currency', currency: 'USD' })
    expect(formatted).toBe('$123,456.79')
  })

  test('td formats dates correctly', () => {
    const date = new Date('2023-12-01T00:00:00Z')
    const formatted = i18nUtils.td(date, { year: 'numeric', month: 'long', day: 'numeric' })

    expect(formatted).toBe('December 1, 2023')
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

  test('resetI18n clears translations and restores defaults', async () => {
    i18nUtils.setLocale('fr')
    i18nUtils.setRouteName('about')
    i18nUtils.mergeTranslations({ leaked: 'yes' })

    resetI18n()

    expect(i18nUtils.getLocale()).toBe('en')
    expect(i18nUtils.getRouteName()).toBe('test')
    expect(i18nUtils.resolveTranslations()).toEqual({})
    expect(i18nUtils.t('greeting')).toBe('greeting')
  })

  test('setRouteName aliases settRouteName', () => {
    i18nUtils.setRouteName('contact')
    expect(i18nUtils.getRouteName()).toBe('contact')
    i18nUtils.settRouteName('about')
    expect(i18nUtils.getRouteName()).toBe('about')
  })

  test('localePath and switchLocalePath use locale prefixes', () => {
    expect(i18nUtils.localePath('/about')).toBe('/en/about')
    expect(i18nUtils.localePath('products', 'de')).toBe('/de/products')
    expect(i18nUtils.switchLocalePath('fr')).toBe('/fr/products')
    expect(i18nUtils.getLocale()).toBe('fr')
  })

  test('localeRoute returns a path object', () => {
    expect(i18nUtils.localeRoute({ name: 'about' })).toEqual({ path: '/en/about', name: 'about' })
    expect(i18nUtils.switchLocaleRoute('de')).toEqual({ path: '/de/about', name: 'test' })
  })

  test('setMissingHandler is called for missing keys', () => {
    const handler = vi.fn()
    i18nUtils.setMissingHandler(handler)
    i18nUtils.t('missing.key')
    expect(handler).toHaveBeenCalledWith('en', 'missing.key', 'test')
  })

  test('_t binds translations to a route name', async () => {
    i18nUtils.setRouteName('home')
    await i18nUtils.setTranslationsFromJson('en', { title: 'Home' })
    await i18nUtils.loadPageTranslations('en', 'about', { title: 'About page' })

    const aboutT = i18nUtils._t({ name: 'about' })
    expect(aboutT('title')).toBe('About page')
    expect(i18nUtils.t('title')).toBe('Home')
  })

  test('createFakeI18n exposes $ and bare aliases', async () => {
    const i18n = createFakeI18n({ spy: vi.fn })
    await i18n.$setTranslationsFromJson('en', { hello: 'Hi' })

    expect(i18n.$t('hello')).toBe('Hi')
    expect(i18n.t('hello')).toBe('Hi')
    expect(i18n.$localePath('/x')).toBe('/en/x')
    expect(i18n.$getI18nConfig().strategy).toBe('prefix')
    expect(vi.isMockFunction(i18n.$t)).toBe(true)
  })
})
