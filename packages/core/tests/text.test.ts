import type { PluralFunc } from '@i18n-micro/types'
import { describe, expect, it, vi } from 'vitest'
import { BaseI18n, defaultPlural, escapeHtml, FormatService, interpolate, pluralForm, resolveText, tokenize } from '../src/index'

class TestI18n extends BaseI18n {
  constructor(
    private locale: string,
    private readonly messages: Record<string, unknown>,
    plural?: PluralFunc,
  ) {
    super({ plural, missingWarn: false })
    this.helper.loadTranslations(locale, messages as never)
  }
  getLocale = () => this.locale
  getFallbackLocale = () => this.locale
  getRoute = () => 'index'
}

const text = (i18n: BaseI18n, options: Parameters<typeof resolveText>[1]) => {
  const resolved = resolveText(i18n, options)
  return resolved && interpolate(resolved.template, resolved.params)
}

describe('tokenize', () => {
  it.each([
    ['plain', ['plain']],
    ['{a}', ['', 'a', '']],
    ['{b} then {a}', ['', 'b', ' then ', 'a', '']],
    ['{a} and {a}', ['', 'a', ' and ', 'a', '']],
    ['{имя} {first-name} {user.name}', ['', 'имя', ' ', 'first-name', ' ', 'user.name', '']],
    ['{ a } {} {{a}}', ['{ a } {} {', 'a', '}']],
  ])('%s', (template, parts) => {
    expect(tokenize(template)).toEqual(parts)
  })

  it('answers one array per template and stays bounded', () => {
    expect(tokenize('{cached}')).toBe(tokenize('{cached}'))
    const first = tokenize('{evicted}')
    for (let i = 0; i < 2100; i++) tokenize(`{n${i}}`)
    expect(tokenize('{evicted}')).not.toBe(first)
    expect(tokenize('{evicted}')).toEqual(first)
  })
})

describe('interpolate', () => {
  it('reorders, repeats and never consumes what a param put in', () => {
    expect(interpolate('{b} {a} {a}', { a: 1, b: 2 })).toBe('2 1 1')
    expect(interpolate('{a} {b}', { a: '{b}', b: 'B' })).toBe('{b} B')
    expect(interpolate('{имя}', { имя: 'И' })).toBe('И')
  })

  it('reads own params only', () => {
    expect(interpolate('{__proto__} {constructor} {toString}', {})).toBe('{__proto__} {constructor} {toString}')
    const own = JSON.parse('{"__proto__":"own"}')
    expect(interpolate('{__proto__}', own)).toBe('own')
  })
})

describe('escapeHtml', () => {
  it('leaves nothing that opens a tag or an attribute', () => {
    expect(escapeHtml(`<a href="x" title='y'>&`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;')
  })
})

describe('plural forms', () => {
  const pick = (template: string, count: number, locale: string) => pluralForm(template, count, locale)

  it.each([
    [0, 'яблок'],
    [1, 'яблоко'],
    [2, 'яблока'],
    [4, 'яблока'],
    [5, 'яблок'],
    [11, 'яблок'],
    [12, 'яблок'],
    [21, 'яблоко'],
    [22, 'яблока'],
    [25, 'яблок'],
    [111, 'яблок'],
    [1000001, 'яблоко'],
  ])('ru one | few | many × %i → %s', (count, form) => {
    expect(pick('яблоко | яблока | яблок', count, 'ru')).toBe(form)
  })

  it('a form per category with {count} in each', () => {
    expect(pick('{count} файл | {count} файла | {count} файлов', 21, 'ru')).toBe('{count} файл')
  })

  it('one more form than categories: the first is for zero', () => {
    const template = 'нет | {count} яблоко | {count} яблока | {count} яблок'
    expect([0, 1, 3, 5, 21].map((count) => pick(template, count, 'ru'))).toEqual([
      'нет',
      '{count} яблоко',
      '{count} яблока',
      '{count} яблок',
      '{count} яблоко',
    ])
  })

  it('a zero-first template of the same size stays on the index rule', () => {
    const template = 'нет яблок | одно яблоко | {count} яблок'
    expect([0, 1, 2, 21].map((count) => pick(template, count, 'ru'))).toEqual(['нет яблок', 'одно яблоко', '{count} яблок', '{count} яблок'])
  })

  it('fewer forms than categories stay on the index rule', () => {
    expect([0, 1, 2, 21].map((count) => pick('a | b', count, 'ru'))).toEqual(['a', 'b', 'b', 'b'])
    expect([0, 1, 2, 3].map((count) => pick('a | b | c', count, 'ar'))).toEqual(['a', 'b', 'c', 'c'])
  })

  it('a locale with a zero category maps every form, the first having no number', () => {
    const template = 'صفر | واحد | اثنان | {count} قليل | {count} كثير | {count} آخر'
    expect([0, 1, 2, 3, 11, 100].map((count) => pick(template, count, 'ar'))).toEqual([
      'صفر',
      'واحد',
      'اثنان',
      '{count} قليل',
      '{count} كثير',
      '{count} آخر',
    ])
  })

  it.each(['en', 'de', 'fr', 'es', 'ja', 'en_US', ''])('%j keeps the index rule for every template', (locale) => {
    expect([0, 1, 2, 5].map((count) => pick('a | b | c', count, locale))).toEqual(['a', 'b', 'c', 'c'])
    expect([0, 1, 2].map((count) => pick('a | b', count, locale))).toEqual(['a', 'b', 'b'])
  })

  it.each([-1, 1.5, Number.NaN])('%d takes the last form in any locale', (count) => {
    expect(pick('яблоко | яблока | яблок', count, 'ru')).toBe('яблок')
    expect(pick('a | b | c', count, 'en')).toBe('c')
  })

  it('builds the rules of a locale once, and a cold cache never exceeds its bound', () => {
    const spy = vi.spyOn(Intl, 'PluralRules')
    pick('a | b | c', 1, 'sk')
    pick('a | b | c', 2, 'sk')
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('defaultPlural interpolates the picked form only', () => {
    const getter = () => '{count} яблоко | {count} яблока | {count} яблок'
    expect(defaultPlural('k', 21, { x: 1 }, 'ru', getter as never)).toBe('21 яблоко')
    expect(defaultPlural('k', 1, {}, 'ru', (() => undefined) as never)).toBeNull()
  })
})

describe('resolveText', () => {
  const messages = {
    hi: 'Hello, {name}!',
    apples: 'none | one | {count} apples',
    ruApples: 'яблоко | яблока | яблок',
    blank: '   ',
    sum: 'total {number}',
    when: 'on {date}',
    ago: 'was {relativeDate}',
    rich: '<b>{name}</b>',
  }
  const i18n = () => new TestI18n('en', messages)

  it('answers the raw template and its values', () => {
    expect(resolveText(i18n(), { keypath: 'hi', params: { name: '{link}' } })).toEqual({ template: 'Hello, {name}!', params: { name: '{link}' } })
  })

  it('picks the plural form before anything is interpolated', () => {
    expect(resolveText(i18n(), { keypath: 'apples', plural: 3 })).toEqual({ template: '{count} apples', params: { count: 3 } })
    expect(text(new TestI18n('ru', messages), { keypath: 'ruApples', plural: 21 })).toBe('яблоко')
  })

  it('treats null props as not set', () => {
    for (const unset of [{ plural: null }, { number: null }, { date: null }, { relativeDate: null }]) {
      expect(text(i18n(), { keypath: 'hi', params: { name: 'Z' }, ...unset })).toBe('Hello, Z!')
    }
  })

  it('counts like tc: a fraction stays a fraction', () => {
    expect(text(i18n(), { keypath: 'apples', plural: 1.5 })).toBe('1.5 apples')
    expect(text(i18n(), { keypath: 'apples', plural: '2' })).toBe('2 apples')
    expect(i18n().tc('apples', 1.5)).toBe('1.5 apples')
  })

  it('formatted values beat a param of that name, and number beats plural', () => {
    expect(text(i18n(), { keypath: 'sum', number: 1500, params: { number: 'PARAM' } })).toBe('total 1,500')
    expect(text(i18n(), { keypath: 'sum', number: 2, plural: 1 })).toBe('total 2')
  })

  it('hides a blank text in every branch', () => {
    for (const branch of [{}, { plural: 1 }, { number: 1 }, { date: 0 }, { relativeDate: 0 }]) {
      expect(resolveText(i18n(), { keypath: 'blank', hideIfEmpty: true, ...branch })).toBeNull()
    }
    expect(resolveText(i18n(), { keypath: 'blank' })?.template).toBe('   ')
  })

  it('escapes params in html mode, not the translation', () => {
    const name = '<img src=x onerror=alert(1)>'
    expect(text(i18n(), { keypath: 'rich', html: true, params: { name } })).toBe('<b>&lt;img src=x onerror=alert(1)&gt;</b>')
    expect(text(i18n(), { keypath: 'rich', params: { name } })).toBe(`<b>${name}</b>`)
    expect(text(i18n(), { keypath: 'rich', html: true, params: { name: 5 } })).toBe('<b>5</b>')
  })

  it('escaping does not mutate params or follow __proto__', () => {
    const params = { name: '<i>' }
    resolveText(i18n(), { keypath: 'rich', html: true, params })
    expect(params).toEqual({ name: '<i>' })
    const hostile = JSON.parse('{"__proto__":{"polluted":"<"},"name":"x"}')
    const resolved = resolveText(i18n(), { keypath: 'rich', html: true, params: hostile })!
    expect(Object.getPrototypeOf(resolved.params)).toBe(Object.prototype)
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })

  describe('customPluralRule keeps its contract', () => {
    it('gets (key, count, params, locale, getter); its answer is used as is', () => {
      const rule = vi.fn<PluralFunc>((key, count, params, locale, getter) => `${locale}:${count}:${getter(key)}:${params.x}:{count}`)
      expect(text(i18n(), { keypath: 'apples', plural: 4, params: { x: 1 }, customPluralRule: rule })).toBe(
        'en:4:none | one | {count} apples:1:{count}',
      )
    })

    it('null renders empty, not the default rule', () => {
      expect(text(i18n(), { keypath: 'apples', plural: 4, customPluralRule: () => null })).toBe('')
    })

    it('a miss reaches the getter as the key', () => {
      expect(text(i18n(), { keypath: 'nope', plural: 4, customPluralRule: (key, _c, _p, _l, getter) => String(getter(key)) })).toBe('nope')
    })

    it('in html mode it interpolates escaped params', () => {
      const rule: PluralFunc = (_k, _c, params) => `<b>${params.name}</b>`
      expect(text(i18n(), { keypath: 'apples', plural: 1, html: true, params: { name: '<i>' }, customPluralRule: rule })).toBe('<b>&lt;i&gt;</b>')
    })
  })

  describe('a configured plural rule', () => {
    const rule: PluralFunc = (_key, count, _params, locale) => (locale === 'en' ? `custom ${count}` : null)

    it('replaces the default in resolveText as in tc', () => {
      const custom = new TestI18n('en', messages, rule)
      expect(custom.tc('apples', 2)).toBe('custom 2')
      expect(text(custom, { keypath: 'apples', plural: 2 })).toBe('custom 2')
    })

    it('null falls back to the default rule, Intl categories included', () => {
      const custom = new TestI18n('ru', messages, rule)
      expect(custom.tc('ruApples', 21)).toBe('яблоко')
      expect(text(custom, { keypath: 'ruApples', plural: 21 })).toBe('яблоко')
    })
  })
})

describe('FormatService timeZone', () => {
  const noon = Date.UTC(2024, 0, 1, 23, 30)

  it('one zone gives one date, and a format can still pick its own', () => {
    const tokyo = new FormatService({ timeZone: 'Asia/Tokyo' })
    expect(tokyo.formatDate(noon, 'en')).toBe('1/2/2024')
    expect(tokyo.formatDate(noon, 'en', { timeZone: 'UTC' })).toBe('1/1/2024')
  })
})
