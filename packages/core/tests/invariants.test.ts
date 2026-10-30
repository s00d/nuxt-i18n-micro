/**
 * What the characterization goldens (`characterization/golden.test.ts`) cannot show as
 * `call → result` rows: hostile inputs, listeners that throw, warnings, cycles, time.
 * Everything else about core's behaviour is pinned by the goldens.
 */
import { afterEach, describe, expect, test, vi } from 'vitest'
import { BaseI18n, type BaseI18nOptions } from '../src/base'
import { collectTranslationPaths, getByPath, mergeTranslationChunk, mergeTranslationLayers } from '../src/helpers'
import { FormatService } from '../src/format-service'
import { createReactiveI18nStore, useTranslationHelper } from '../src'

class TestI18n extends BaseI18n {
  constructor(
    private locale: string,
    options?: BaseI18nOptions,
  ) {
    super(options)
  }
  getLocale() {
    return this.locale
  }
  getFallbackLocale() {
    return this.locale
  }
  getRoute() {
    return 'index'
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('hostile input', () => {
  test('a lookup reads array items by index, never array or prototype members', () => {
    const tree = { list: ['a', 'b'] }
    expect(getByPath(tree, 'list.1')).toBe('b')
    expect(getByPath(tree, 'list.length')).toBeUndefined()
    expect(getByPath(tree, 'list.map')).toBeUndefined()
    expect(getByPath(tree, 'toString')).toBeUndefined()
    expect(getByPath(tree, 'list.__proto__')).toBeUndefined()
  })

  test('a polluted Object.prototype never answers a lookup', () => {
    const helper = useTranslationHelper()
    helper.loadTranslations('en', { nav: { home: 'Home' } })
    const proto = Object.prototype as Record<string, unknown>
    proto.polluted = 'EVIL'
    try {
      expect(helper.getTranslation('en', 'index', 'polluted')).toBeNull()
      expect(helper.getTranslation('en', 'index', 'nav.polluted')).toBeNull()
    } finally {
      delete proto.polluted
    }
  })

  test('cyclic objects passed in by code are cut instead of overflowing; shared subtrees are still walked', () => {
    const cyclic: Record<string, unknown> = { a: 'A' }
    cyclic.self = cyclic
    expect(() => mergeTranslationLayers({ a: { b: 1 } }, cyclic)).not.toThrow()
    const paths = new Set<string>()
    collectTranslationPaths(cyclic, paths)
    expect([...paths]).toEqual(['a', 'self'])
    const shared = { x: 1 }
    const walked = new Set<string>()
    collectTranslationPaths({ a: shared, b: shared }, walked)
    expect([...walked]).toEqual(['a', 'a.x', 'b', 'b.x'])
  })
})

describe('merges', () => {
  test('a flat key of the lower layer does not hide the upper nested value', () => {
    const merged = mergeTranslationLayers({ 'a.b': 'old', 'c.d': 'kept', 'e.f': 'low' }, { a: { b: 'new' }, c: 'scalar', 'e.f': 'up' })
    expect([getByPath(merged, 'a.b'), getByPath(merged, 'c.d'), getByPath(merged, 'e.f')]).toEqual(['new', 'kept', 'up'])
  })

  test('__proto__ from JSON is dropped by a merge into an empty chunk, as by any other', () => {
    const incoming = JSON.parse('{"__proto__":{"x":"y"},"a":1}')
    expect(getByPath(mergeTranslationChunk({}, incoming), '__proto__.x')).toBeUndefined()
    const helper = useTranslationHelper()
    helper.mergeTranslation('en', 'proto', incoming)
    expect(helper.getTranslation('en', 'proto', '__proto__.x')).toBeNull()
    expect(helper.getTranslation('en', 'proto', 'a')).toBe(1)
  })
})

describe('listeners and caches', () => {
  test('a listener removed by an earlier one does not run', () => {
    const store = createReactiveI18nStore({ locale: 'en' })
    const calls: string[] = []
    store.subscribe(() => {
      calls.push('first')
      off()
    })
    const off = store.subscribe(() => calls.push('removed'))
    store.notify()
    expect(calls).toEqual(['first'])
  })

  test('format options of another type are another formatter', () => {
    const format = new FormatService()
    const off = format.getNumberFormatter('en-US', { useGrouping: false })
    const auto = format.getNumberFormatter('en-US', { useGrouping: 'false' as unknown as boolean })
    expect(off.format(1234567)).toBe('1234567')
    expect(auto.format(1234567)).toBe('1,234,567')
  })

  test('a throwing listener does not stop the others; the error surfaces after all ran', () => {
    const store = createReactiveI18nStore({ locale: 'en' })
    const calls: string[] = []
    store.subscribe(() => {
      throw new Error('boom')
    })
    store.subscribe(() => calls.push('second'))
    expect(() => store.setLocale('de')).toThrow('boom')
    expect(calls).toEqual(['second'])
    expect(store.getLocale()).toBe('de')
  })

  test('a loaded page chunk is cached and answers lookups', async () => {
    const helper = useTranslationHelper()
    await helper.loadPageTranslations('fr', 'home', { greeting: 'Bonjour, {name}!' })
    expect(helper.hasPageTranslation('fr', 'home')).toBe(true)
    expect(helper.getTranslation('fr', 'home', 'greeting')).toBe('Bonjour, {name}!')
  })
})

describe('formats', () => {
  test('a missing named number format warns in dev and falls back to Intl defaults', () => {
    vi.stubGlobal('window', {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const i18n = new TestI18n('en', { numberFormats: { en: { currency: { style: 'currency', currency: 'USD' } } } })
    expect(i18n.tn(1000, 'nonexistent')).toBe('1,000')
    expect(warn).toHaveBeenCalledWith("Not found 'nonexistent' number format in 'en' locale. Falling back to default Intl options.")
  })

  test('relative time is measured from now', () => {
    vi.useFakeTimers({ now: new Date('2026-01-10T12:00:00Z') })
    const i18n = new TestI18n('en')
    expect(i18n.tdr(new Date('2026-01-09T12:00:00Z'))).toBe('1 day ago')
    expect(i18n.tdr(new Date('2026-01-09T12:00:00Z'), { numeric: 'auto' })).toBe('yesterday')
  })
})
