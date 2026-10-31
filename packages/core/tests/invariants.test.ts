/**
 * What the characterization goldens (`characterization/golden.test.ts`) cannot show as
 * `call → result` rows: hostile inputs, listeners that throw, warnings, cycles, time.
 * Everything else about core's behaviour is pinned by the goldens.
 */
import { afterEach, describe, expect, test, vi } from 'vitest'
import { BaseI18n, type BaseI18nOptions } from '../src/base'
import { collectTranslationPaths, getByPath, mergeTranslationChunk, mergeTranslationLayers, resolveText, resolveTranslation, setTranslationAtKey } from '../src/helpers'
import { FormatService } from '../src/format-service'
import { createReactiveI18nStore, useTranslationHelper } from '../src'
import { Recorder } from './characterization/record'

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

test('tc picks the form before it interpolates: a pipe in a param is no form', () => {
  const i18n = new TestI18n('en', { missingWarn: false })
  i18n.loadTranslationsCore('en', { items: 'Hello {name}|Hi {name}|Hey {name} ({count})' }, false)
  expect(i18n.tc('items', { count: 0, name: 'a|b' })).toBe('Hello a|b')
  expect(i18n.tc('items', { count: 1, name: 'a|b' })).toBe('Hi a|b')
  expect(i18n.tc('items', { count: 5, name: 'a|b' })).toBe('Hey a|b (5)')
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

describe('a merge into an empty chunk', () => {
  test('drops __proto__ at every level and shares no node with the input', () => {
    const incoming = JSON.parse('{"a":{"__proto__":{"x":"y"},"b":{"__proto__":{"x":"y"},"c":1}},"list":[1]}')
    const merged = mergeTranslationChunk({}, incoming)
    expect(Object.keys(merged.a as object)).toEqual(['b'])
    expect(Object.keys((merged.a as { b: object }).b)).toEqual(['c'])
    expect(merged.a).not.toBe(incoming.a)
    expect(merged.list).not.toBe(incoming.list)
  })

  test('keeps a cycle and an aliased node instead of overflowing', () => {
    const shared = { v: 1 }
    const incoming: Record<string, unknown> = { one: shared, two: shared }
    incoming.self = incoming
    const merged = mergeTranslationChunk({}, incoming)
    expect(merged.self).toBe(merged)
    expect(merged.one).toBe(merged.two)
  })
})

describe('the golden recorder', () => {
  test('a thrown value it cannot print is recorded, not rethrown', () => {
    const recorder = new Recorder()
    const circular: Record<string, unknown> = {}
    circular.self = circular
    recorder.run('bigint', () => {
      throw 1n
    })
    recorder.run('circular', () => {
      throw circular
    })
    recorder.run('plain', () => {
      throw 'text'
    })
    expect(recorder.toString().trim().split('\n')).toEqual([
      '- `bigint` → throws [unserializable]',
      '- `circular` → throws [unserializable]',
      '- `plain` → throws "text"',
    ])
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

test('formatter caches are bounded: a loop over generated options cannot grow them for ever', () => {
  const service = new FormatService()
  const sizes = () => (service as unknown as { numberCache: Map<string, unknown> }).numberCache.size
  // an option Intl ignores: every key is another formatter
  for (let i = 0; i < 1200; i++) service.formatNumber(1, 'en', { [`generated${i}`]: 1 } as Intl.NumberFormatOptions)
  expect(sizes()).toBeLessThanOrEqual(500)
  expect(service.formatNumber(1.5, 'en')).toBe('1.5')
})

describe('a shared formatter', () => {
  test('survives clearCache of an instance it was only lent to', () => {
    const formatter = new FormatService()
    const clear = vi.spyOn(formatter, 'clearCache')
    class Lent extends BaseI18n {
      getLocale = () => 'en'
      getFallbackLocale = () => 'en'
      getRoute = () => 'index'
    }
    new Lent({ formatter }).clearCache()
    expect(clear).not.toHaveBeenCalled()
  })
})

describe('storage owns what it stores', () => {
  const incoming = () => ({ sec: { title: 'v1', list: ['a', { b: 'c' }] } })

  test.each([
    ['into an empty chunk', {}],
    ['into a chunk that has other keys', { base: 'x' }],
    ['over a scalar', { sec: 'old' }],
  ])('a merge %s shares nothing with the caller', (_name, existing) => {
    const from = incoming()
    const merged = mergeTranslationChunk(existing, from) as typeof from
    expect(merged.sec).not.toBe(from.sec)
    expect(merged.sec.list).not.toBe(from.sec.list)
    expect(merged.sec.list[1]).not.toBe(from.sec.list[1])
    expect(merged.sec).toEqual(from.sec)
  })

  test('the leaf cache cannot disagree with its tree', () => {
    const helper = useTranslationHelper()
    helper.loadTranslations('en', { base: 'x' })
    const from = incoming()
    helper.loadTranslations('en', from)
    expect(helper.getTranslation('en', 'index', 'sec.title')).toBe('v1')
    from.sec.title = 'EDITED'
    ;(from.sec.list as string[])[0] = 'EDITED'
    expect(helper.getTranslation('en', 'index', 'sec.title')).toBe('v1')
    expect(helper.getTranslation('en', 'index', 'sec.list.0')).toBe('a')
    expect(helper.getTranslation('en', 'index', 'sec')).toMatchObject({ title: 'v1' })
  })

  test('preserveExisting keeps what is there, and copies what it adds', () => {
    const from = { keep: { x: 'new' }, add: { y: 1 } }
    const merged = mergeTranslationChunk({ keep: 'old' }, from, { preserveExisting: true })
    expect(merged).toEqual({ keep: 'old', add: { y: 1 } })
    expect(merged.add).not.toBe(from.add)
  })

  test('only the nodes of existing on the path are copied', () => {
    const other = { deep: 'value' }
    const merged = mergeTranslationChunk({ other, sec: { a: 1 } }, { sec: { b: 2 } })
    expect(merged.other).toBe(other)
  })

  test('aliased nodes of the patch stay aliased, a cycle stays a cycle', () => {
    const shared = { a: 1 }
    const cyclic: Record<string, unknown> = { shared, again: shared }
    cyclic.self = cyclic
    const merged = mergeTranslationChunk({ base: 'x' }, { cyclic }) as { cyclic: typeof cyclic }
    expect(merged.cyclic.shared).toBe(merged.cyclic.again)
    expect(merged.cyclic.self).toBe(merged.cyclic)
  })
})

describe('__proto__ in a merge', () => {
  const hostile = () => JSON.parse('{"n":{"__proto__":{"evil":1},"k":"v"},"list":[{"__proto__":{"evil":1},"k":"v"}]}')

  test.each([
    ['empty', {}],
    ['not empty', { other: 'x' }],
    ['with the node', { n: { o: 1 } }],
  ])('is dropped at any depth, target %s', (_name, target) => {
    const merged = mergeTranslationChunk(target, hostile()) as { n: object; list: object[] }
    expect(Object.keys(merged.n)).not.toContain('__proto__')
    expect(getByPath(merged, 'n.__proto__.evil')).toBeUndefined()
    expect(Object.keys(merged.list[0]!)).toEqual(['k'])
  })
})

describe('layers answer what t() answers', () => {
  const chain = (lower: object, upper: object, key: string) => resolveTranslation(upper as never, key) ?? resolveTranslation(lower as never, key)

  test.each([
    [{ list: ['a', 'b'] }, { list: 's' }, 'list.0'],
    [{ list: ['a', 'b'] }, { list: 's' }, 'list.1'],
    [{ list: ['a'] }, { list: { x: 1 } }, 'list.0'],
    [{ list: ['a'] }, { list: { x: 1 } }, 'list.x'],
    [{ a: { 0: 'low' } }, { a: ['up'] }, 'a.0'],
    [{ list: ['a', 'b', 'c'] }, { list: ['x'] }, 'list.0'],
    [{ list: ['a', 'b', 'c'] }, { list: ['x'] }, 'list.2'],
    [{ a: [{ b: 'deep' }] }, { a: 's' }, 'a.0.b'],
    [{ a: { b: 'low' } }, { a: 's', 'a.b': 'flat' }, 'a.b'],
    [{ a: { length: 'x' } }, { a: ['y'] }, 'a.length'],
  ])('%j under %j: %s', (lower, upper, key) => {
    expect(resolveTranslation(mergeTranslationLayers(lower, upper), key)).toBe(chain(lower, upper, key))
  })

  test('from an instance, fallback under the locale', () => {
    const i = new TestI18n('de', { storage: { translations: new Map([['de:index', { list: 'eins' }], ['en:index', { list: ['one', 'two'] }]]) } })
    i.getFallbackLocale = () => 'en'
    expect(i.t('list.0')).toBe('one')
    expect(resolveTranslation(i.resolveTranslations(), 'list.0')).toBe('one')
  })
})

describe('reading and setting around arrays and null', () => {
  test('a null flat key does not hide the nested value', () => {
    expect(resolveTranslation({ 'a.b': null, a: { b: 'x' } }, 'a.b')).toBe('x')
    expect(resolveTranslation({ 'a.b': 'flat', a: { b: 'x' } }, 'a.b')).toBe('flat')
    expect(resolveTranslation({ 'a.b': null }, 'a.b')).toBeNull()
    expect(resolveTranslation({ a: null }, 'a')).toBeNull()
  })

  test('set through an array keeps its other items, and the input', () => {
    const tree = { list: ['a', 'b', 'c'] }
    expect(setTranslationAtKey(tree, 'list.1', 'Z')).toEqual({ list: ['a', 'Z', 'c'] })
    expect(setTranslationAtKey({ list: [{ a: 1 }] }, 'list.0.a', 2)).toEqual({ list: [{ a: 2 }] })
    expect(tree).toEqual({ list: ['a', 'b', 'c'] })
  })

  test('a name that is no index still replaces the array, and `length` is an ordinary key', () => {
    expect(setTranslationAtKey({ list: ['a'] }, 'list.name', 'x')).toEqual({ list: { name: 'x' } })
    expect(setTranslationAtKey({ list: ['a'] }, 'list.length', 'x')).toEqual({ list: { length: 'x' } })
  })
})

describe('ts()', () => {
  test('a subtree with a `toString` key is a subtree', () => {
    const i = new TestI18n('en', { storage: { translations: new Map([['en:index', { section: { toString: 'label' }, list: ['a', 'b'], n: 1 }]]) } })
    expect(i.ts('section')).toBe('[object Object]')
    expect(i.ts('list')).toBe('a,b')
    expect(i.ts('n')).toBe('1')
    expect(i.ts('missing', undefined, 'dv')).toBe('dv')
  })
})

describe('formatters and the locale code', () => {
  const at = (locale: string, localeIso?: Record<string, string>) => new TestI18n(locale, { localeIso, timeZone: 'UTC', now: () => 0 })

  test.each(['en_US', 'zh_CN', 'ua', 'not a tag', 'x'])('%s: no throw where tc works', (code) => {
    const i = at(code)
    expect(typeof i.tc('k', 1)).toBe('string')
    expect(typeof i.tn(1)).toBe('string')
    expect(typeof i.td(0)).toBe('string')
    expect(typeof i.tdr(0)).toBe('string')
  })

  test('`_` reads as `-`', () => {
    expect(at('de_DE').tn(1234.5)).toBe(new Intl.NumberFormat('de-DE').format(1234.5))
  })

  test('`iso` decides, in every formatter', () => {
    const i = at('ua', { ua: 'uk-UA' })
    expect(i.tn(1234.5)).toBe(new Intl.NumberFormat('uk-UA').format(1234.5))
    expect(i.td(0)).toBe(new Intl.DateTimeFormat('uk-UA', { timeZone: 'UTC' }).format(0))
    expect(i.tdr(-60000)).toBe(new Intl.RelativeTimeFormat('uk-UA').format(-1, 'minute'))
    expect(at('en_US', { en_US: 'en-GB' }).td(0)).toBe(new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC' }).format(0))
  })

  test('a code Intl does not know formats one way, not by the host', () => {
    expect(at('ua').tn(1234.5)).toBe(new Intl.NumberFormat('en').format(1234.5))
  })

  test('named formats are looked up by code, then formatted by iso', () => {
    const i = new TestI18n('ua', { localeIso: { ua: 'uk-UA' }, numberFormats: { ua: { two: { minimumFractionDigits: 2 } } } })
    expect(i.tn(1, 'two')).toBe(new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 2 }).format(1))
  })
})

describe('named formats read own keys only', () => {
  test.each(['constructor', '__proto__', 'toString'])('%s', (key) => {
    const f = new FormatService({ numberFormats: { en: { currency: {} } }, datetimeFormats: { en: {} } })
    expect(f.resolveNumberFormat('en', key)).toBeUndefined()
    expect(f.resolveDateTimeFormat('en', key)).toBeUndefined()
    expect(f.resolveNumberFormat('constructor', 'name')).toBeUndefined()
  })
})

describe('relative time under a second', () => {
  const f = new FormatService({ now: () => 1000000 })

  test('keeps its sign', () => {
    expect(f.formatRelativeTime(999500, 'en')).toBe('0 seconds ago')
    expect(f.formatRelativeTime(1000500, 'en')).toBe('in 0 seconds')
    expect(f.formatRelativeTime(999500, 'en', { numeric: 'auto' })).toBe('now')
  })
})

describe('a key that found no translation under html', () => {
  const key = '<img src=x onerror=alert(1)>'
  const escaped = '&lt;img src=x onerror=alert(1)&gt;'
  const host = () => new TestI18n('en', { storage: { translations: new Map([['en:index', { hi: '<b>Hi</b>', [key]: '<i>own</i>', tree: { a: 1 } }]]) } })
  const empty = () => new TestI18n('en', { missingWarn: false })

  test('is text', () => {
    expect(resolveText(empty(), { keypath: key, html: true })?.template).toBe(escaped)
    expect(resolveText(empty(), { keypath: key, html: true, plural: 2 })?.template).toBe(escaped)
    expect(resolveText(host(), { keypath: 'tree', html: true, plural: 2 })?.template).toBe('tree')
  })

  test('through a custom plural rule, and a configured one', () => {
    const rule = (k: unknown, _c: number, _p: unknown, _l: string, getter: (key: never) => unknown) => getter(k as never) as string
    expect(resolveText(empty(), { keypath: key, html: true, plural: 2, customPluralRule: rule as never })?.template).toBe(escaped)
    const custom = new TestI18n('en', { plural: () => null, missingWarn: false })
    expect(resolveText(custom, { keypath: key, html: true, plural: 2 })?.template).toBe(escaped)
  })

  test('a translation stays markup, also one under a key of that shape', () => {
    expect(resolveText(host(), { keypath: 'hi', html: true })?.template).toBe('<b>Hi</b>')
    expect(resolveText(host(), { keypath: key, html: true })?.template).toBe('<i>own</i>')
  })

  test('without html a key is what it was, and a default stands in', () => {
    expect(resolveText(empty(), { keypath: key })?.template).toBe(key)
    expect(resolveText(empty(), { keypath: key, html: true, defaultValue: '<b>dv</b>' })?.template).toBe('<b>dv</b>')
  })
})

describe('<i18n-t plural> answers what tc answers', () => {
  const i = () => new TestI18n('en', { missingWarn: false, storage: { translations: new Map([['en:index', { yes: true, tree: { a: 1 }, ok: 'a | b' }]]) } })
  const text = (options: Parameters<typeof resolveText>[1]) => {
    const resolved = resolveText(i(), options)!
    return resolved.template.replace('{count}', String(options.plural))
  }

  test.each([
    ['miss', 2, 'a | b'],
    ['a|b', 2, undefined],
    ['yes', 2, 'dv'],
    ['tree', 2, 'dv {count}'],
    ['yes', 2, undefined],
    ['ok', 2, 'dv'],
  ])('%s, count %s, default %s', (keypath, plural, defaultValue) => {
    expect(text({ keypath, plural, defaultValue })).toBe(i().tc(keypath, plural, defaultValue))
  })

  test('an empty default is the prop default of <i18n-t>: the key, unlike tc', () => {
    expect(text({ keypath: 'miss', plural: 2, defaultValue: '' })).toBe('miss')
  })
})
