import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { createApp } from 'vue'
import { createI18n, useI18n, VueI18n } from '../src'

// Suppress expected Vue warnings about router injection in tests
// These warnings are expected when router is not installed (e.g., in unit tests)
let warnSpy: ReturnType<typeof jest.spyOn> | undefined

beforeEach(() => {
  // Suppress Vue warnings about missing router injection
  // These are expected in tests where router is not set up
  warnSpy = jest.spyOn(console, 'warn').mockImplementation((message: string) => {
    // Only suppress router-related warnings
    if (typeof message === 'string' && (
      message.includes('injection "Symbol(router)" not found')
      || message.includes('injection "Symbol(route location)" not found')
    )) {
      return
    }
    // Let other warnings through
    console.warn(message)
  })
})

afterEach(() => {
  if (warnSpy) {
    warnSpy.mockRestore()
    warnSpy = undefined
  }
})

describe('VueI18n', () => {
  test('should create i18n instance', () => {
    const i18n = new VueI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    expect(i18n.locale.value).toBe('en')
    expect(i18n.t('greeting')).toBe('Hello')
  })

  test('should translate with interpolation', () => {
    const i18n = new VueI18n({
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
    const i18n = new VueI18n({
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
    const i18n = new VueI18n({
      locale: 'en',
    })

    expect(i18n.tn(1234.56)).toMatch(/1[,.]234[.,]56/)
  })

  test('should format dates', () => {
    const i18n = new VueI18n({
      locale: 'en',
    })

    const date = new Date('2023-01-15')
    const formatted = i18n.td(date)
    expect(formatted).toBeTruthy()
  })

  test('should format relative time', () => {
    const i18n = new VueI18n({
      locale: 'en',
    })

    const oneHourAgo = new Date(Date.now() - 3600000)
    const formatted = i18n.tdr(oneHourAgo)
    expect(formatted).toMatch(/hour/)
  })

  test('should handle route-specific translations', () => {
    const i18n = new VueI18n({
      locale: 'en',
      messages: {
        en: {
          title: 'Global Title',
        },
      },
    })

    i18n.addRouteTranslations('en', 'home', {
      title: 'Home Title',
    }, false) // Use merge: false to avoid warning

    i18n.setRoute('home')
    expect(i18n.t('title')).toBe('Home Title')

    i18n.setRoute('general')
    expect(i18n.t('title')).toBe('Global Title')
  })

  test('should fallback to fallbackLocale', () => {
    const i18n = new VueI18n({
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
})

describe('createI18n plugin', () => {
  test('should install plugin', () => {
    const app = createApp({})
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    app.use(i18n)

    expect(app.config.globalProperties.$t).toBeDefined()
    expect(app.config.globalProperties.$i18n).toBeDefined()
  })

  test('should provide i18n instance', () => {
    const app = createApp({
      template: '<div></div>',
      setup() {
        const { t } = useI18n()
        expect(t('greeting', undefined, undefined, 'general')).toBe('Hello')
        return {}
      },
    })

    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    app.use(i18n)
    app.mount(document.createElement('div'))
  })
})

describe('useI18n composable', () => {
  test('should return reactive locale', () => {
    const app = createApp({
      template: '<div></div>',
      setup() {
        const { locale } = useI18n()
        expect(locale.value).toBe('en')
        locale.value = 'fr'
        expect(locale.value).toBe('fr')
        return {}
      },
    })

    const i18n = createI18n({
      locale: 'en',
    })

    app.use(i18n)
    app.mount(document.createElement('div'))
  })

  test('should return all translation methods', () => {
    const app = createApp({
      template: '<div></div>',
      setup() {
        const i18n = useI18n()
        expect(typeof i18n.t).toBe('function')
        expect(typeof i18n.tc).toBe('function')
        expect(typeof i18n.tn).toBe('function')
        expect(typeof i18n.td).toBe('function')
        expect(typeof i18n.tdr).toBe('function')
        expect(typeof i18n.has).toBe('function')
        return {}
      },
    })

    const i18nPlugin = createI18n({
      locale: 'en',
    })

    app.use(i18nPlugin)
    app.mount(document.createElement('div'))
  })

  test('should handle route-specific translations', () => {
    const app = createApp({
      template: '<div></div>',
      setup() {
        const { t, setRoute } = useI18n()
        setRoute('home')
        expect(t('title')).toBe('Home Title')
        setRoute('general')
        expect(t('title')).toBe('Global Title')
        return {}
      },
    })

    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          title: 'Global Title',
        },
      },
    })

    i18n.global.addRouteTranslations('en', 'home', {
      title: 'Home Title',
    }, false)

    app.use(i18n)
    app.mount(document.createElement('div'))
  })

  test('should handle pluralization', () => {
    const app = createApp({
      template: '<div></div>',
      setup() {
        const { tc } = useI18n()
        expect(tc('apples', 0)).toBe('no apples')
        expect(tc('apples', 1)).toBe('one apple')
        expect(tc('apples', 5)).toBe('5 apples')
        return {}
      },
    })

    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          apples: 'no apples | one apple | {count} apples',
        },
      },
    })

    app.use(i18n)
    app.mount(document.createElement('div'))
  })

  test('should format numbers and dates', () => {
    const app = createApp({
      template: '<div></div>',
      setup() {
        const { tn, td, tdr } = useI18n()
        expect(tn(1234.56)).toMatch(/1[,.]234[.,]56/)
        expect(td(new Date('2023-01-15'))).toBeTruthy()
        const oneHourAgo = new Date(Date.now() - 3600000)
        expect(tdr(oneHourAgo)).toMatch(/hour/)
        return {}
      },
    })

    const i18n = createI18n({
      locale: 'en',
    })

    app.use(i18n)
    app.mount(document.createElement('div'))
  })
})
