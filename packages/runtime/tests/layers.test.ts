import { describe, expect, test, vi } from 'vitest'
import { createI18n } from '../src'

describe('root and route layers', () => {
  test('a route chunk holds its own keys; root keys, also ones added later, resolve from the root', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello', nav: { x: { y: { root: 'R' } } } } },
      routeMessages: { blog: { en: { title: 'Blog', nav: { x: { y: { page: 'P' } } } } } },
    })
    i18n.setRoute('blog')
    expect(i18n.t('title')).toBe('Blog')
    expect(i18n.t('hello')).toBe('Hello')
    expect(i18n.t('nav.x.y.root')).toBe('R')
    expect(i18n.t('nav.x.y.page')).toBe('P')
    i18n.addTranslations('en', { added: 'Added later' })
    expect(i18n.t('added')).toBe('Added later')
    i18n.setRoute('no-chunk-here')
    expect(i18n.t('hello')).toBe('Hello')
  })
})
