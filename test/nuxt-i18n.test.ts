import { describe, expect, it, vi } from 'vitest'
import { NuxtI18n } from '../src/runtime/utils/nuxt-i18n'

describe('NuxtI18n', () => {
  it('does not use fallback locale when key is missing in current locale', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { greeting: 'Hello' })
    i18n.setChunk('de', 'index', { greeting: 'Hallo' })
    i18n.applySwitchContext('en', 'index', i18n.getChunk('en', 'index'))

    expect(i18n.t('greeting')).toBe('Hello')
    expect(i18n.t('missing')).toBe('missing')
  })

  it('deep-merges view layer on same-locale page navigation and cleans up after transition', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { common: { fromA: 'From A' }, pageA: 'A' })
    i18n.applySwitchContext('en', 'page-b', { common: { fromB: 'From B' }, pageB: 'B' })

    expect(i18n.t('common.fromA')).toBe('From A')
    expect(i18n.t('common.fromB')).toBe('From B')
    expect(i18n.t('pageB')).toBe('B')

    i18n.finishTransition()

    expect(i18n.has('common.fromA')).toBe(false)
    expect(i18n.t('common.fromB')).toBe('From B')
  })

  it('clears pending cleanup on locale switch', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { title: 'EN A' })
    i18n.applySwitchContext('en', 'page-b', { title: 'EN B' })
    i18n.applySwitchContext('de', 'page-a', { title: 'DE A' })

    expect(i18n.t('title')).toBe('DE A')
    i18n.finishTransition()
    expect(i18n.t('title')).toBe('DE A')
  })

  it('does not leak previous-locale keys after locale switch', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { onlyInEn: 'English only', title: 'EN' })
    i18n.applySwitchContext('de', 'page-a', { title: 'DE' })

    expect(i18n.t('title')).toBe('DE')
    expect(i18n.has('onlyInEn')).toBe(false)
    expect(i18n.t('onlyInEn')).toBe('onlyInEn')
  })

  it('resolves route-specific translations via tForRoute', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setRouteContextResolver((route) => route as { locale: string; routeName: string })
    i18n.setChunk('en', 'page-a', { title: 'Route A' })
    i18n.setChunk('en', 'page-b', { title: 'Route B' })
    i18n.applySwitchContext('en', 'page-b', i18n.getChunk('en', 'page-b'))

    const tForA = i18n.tForRoute({ locale: 'en', routeName: 'page-a' })
    expect(tForA('title')).toBe('Route A')
    expect(i18n.t('title')).toBe('Route B')
  })

  it('has() checks merged view layer including nested keys', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { common: { nested: 'value' } })
    i18n.applySwitchContext('en', 'page-b', { other: 'x' })

    expect(i18n.has('common.nested')).toBe(true)
  })

  it('mergeTranslationAsync loads missing chunk before merging', async () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    const loader = vi.fn(async (locale: string, routeName?: string) => {
      return { loaded: `${locale}:${routeName || 'index'}` }
    })

    i18n.applySwitchContext('en', 'index', { base: 'Base' })
    await i18n.mergeTranslationAsync('en', 'page-a', { extra: 'Extra' }, loader)

    expect(loader).toHaveBeenCalledWith('en', 'page-a')
    expect(i18n.getChunk('en', 'page-a')).toEqual({ loaded: 'en:page-a', extra: 'Extra' })
  })

  it('mergeTranslationAsync updates active view when locale and route match', async () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { title: 'Initial' })

    await i18n.mergeTranslationAsync('en', 'page-a', { injected: 'Yes' }, async () => ({}))

    expect(i18n.t('injected')).toBe('Yes')
    expect(i18n.t('title')).toBe('Initial')
  })

  it('interpolates params in t()', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'index', { hello: 'Hello {name}' })

    expect(i18n.t('hello', { name: 'World' })).toBe('Hello World')
  })

  it('clearCache resets storage and view layer', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'index', { title: 'Hello' })
    i18n.clearCache()

    expect(i18n.has('title')).toBe(false)
    expect(i18n.getChunk('en', 'index')).toEqual({})
  })
})
