import { describe, expect, test } from 'vitest'
import { AstroI18n } from '../src/composer'

describe('AstroI18n.fork', () => {
  test('clearCache on a fork restores the initial messages and leaves the parent alone', () => {
    const global = new AstroI18n({ locale: 'en', messages: { en: { hello: 'Hi' } }, missingWarn: false })
    global.addTranslations('en', { later: 'Later' })
    const request = global.fork()
    request.addTranslations('en', { hello: 'Changed' })
    request.clearCache()
    expect(request.t('hello')).toBe('Hi')
    expect(request.t('later')).toBe('later')
    expect(global.t('later')).toBe('Later')
  })

  test('clearCache keeps route messages from the constructor too', () => {
    const global = new AstroI18n({
      locale: 'en',
      messages: { en: { hello: 'Hi' } },
      routeMessages: { about: { en: { title: 'About' } } },
      missingWarn: false,
    })
    const request = global.fork()
    request.clearCache()
    expect(request.t('hello')).toBe('Hi')
    expect(request.t('title', undefined, undefined, 'about')).toBe('About')
  })

  test('resolveTranslations and setTranslation work on the active tree of an instance', () => {
    const i18n = new AstroI18n({ locale: 'en', messages: { en: { greeting: 'Hello' } } })
    expect(i18n.resolveTranslations()).toEqual({ greeting: 'Hello' })
    i18n.setTranslation('greeting', 'Hi')
    expect(i18n.resolveTranslations()).toEqual({ greeting: 'Hi' })
    expect(i18n.t('greeting')).toBe('Hi')
  })

  test('a request keeps the Intl formatters of the site: building them is the slow part', () => {
    const global = new AstroI18n({ locale: 'en', numberFormats: { en: { pct: { style: 'percent' } } } })
    expect(global.fork('de').formatter).toBe(global.formatter)
    expect(global.fork().tn(0.5, 'pct')).toBe('50%')
  })
})
