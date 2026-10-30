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
  const picks = (template: string, counts: number[], locale: string) => counts.map((count) => pick(template, count, locale))

  describe('a template without the marker stays on the index rule', () => {
    it.each([
      ['яблоко | яблока | яблок', ['яблоко', 'яблока', 'яблок', 'яблок', 'яблок']],
      ['нет | одно | много', ['нет', 'одно', 'много', 'много', 'много']],
      ['нет яблок | одно яблоко | {count} яблок', ['нет яблок', 'одно яблоко', '{count} яблок', '{count} яблок', '{count} яблок']],
      ['нет товаров | {n} товар | {n} товаров', ['нет товаров', '{n} товар', '{n} товаров', '{n} товаров', '{n} товаров']],
      [
        '{count} товаров | {count} товар | {count} товара',
        ['{count} товаров', '{count} товар', '{count} товара', '{count} товара', '{count} товара'],
      ],
      ['нет | один | два | {count} много', ['нет', 'один', 'два', '{count} много', '{count} много']],
      ['нет | один | {count} a | {count} b', ['нет', 'один', '{count} a', '{count} b', '{count} b']],
      ['a | b', ['a', 'b', 'b', 'b', 'b']],
    ])('ru %s', (template, forms) => {
      expect(picks(template, [0, 1, 2, 5, 21], 'ru')).toEqual(forms)
    })

    it('a numbered first form is no zero form', () => {
      expect(picks('{count} a | {count} b | {count} c | {count} d', [0, 1, 2, 3, 21], 'ru')).toEqual([
        '{count} a',
        '{count} b',
        '{count} c',
        '{count} d',
        '{count} d',
      ])
    })

    it('two categories stay on the index rule even where one is not just 1', () => {
      expect(picks('a | {count} b | {count} c', [0, 1, 2, 21], 'is')).toEqual(['a', '{count} b', '{count} c', '{count} c'])
    })

    it('a fallback text keeps its own shape on another locale', () => {
      expect(picks('zero | one | many', [0, 1, 2, 21], 'ru')).toEqual(['zero', 'one', 'many', 'many'])
    })

    it.each(['en', 'de', 'fr', 'es', 'ja', 'en_US', ''])('%j', (locale) => {
      expect(picks('a | b | c', [0, 1, 2, 5], locale)).toEqual(['a', 'b', 'c', 'c'])
      expect(picks('a | b', [0, 1, 2], locale)).toEqual(['a', 'b', 'b'])
    })

    it.each([-1, 1.5, Number.NaN])('%d takes the last form', (count) => {
      expect(pick('яблоко | яблока | яблок', count, 'ru')).toBe('яблок')
      expect(pick('a | b | c', count, 'en')).toBe('c')
    })
  })

  describe('the one unmarked shape with categories: a zero form, then a numbered form per category', () => {
    it('ru', () => {
      const template = 'нет | {count} яблоко | {count} яблока | {count} яблок'
      expect(picks(template, [0, 1, 3, 5, 21, 22, 111, 1000001], 'ru')).toEqual([
        'нет',
        '{count} яблоко',
        '{count} яблока',
        '{count} яблок',
        '{count} яблоко',
        '{count} яблока',
        '{count} яблок',
        '{count} яблоко',
      ])
    })

    it('ar: forms for exactly one count need no number', () => {
      const template = 'صفر | واحد | اثنان | {count} قليل | {count} كثير | {count} آخر'
      expect(picks(template, [0, 1, 2, 3, 11, 100], 'ar')).toEqual(['صفر', 'واحد', 'اثنان', '{count} قليل', '{count} كثير', '{count} آخر'])
    })

    it('a count past the probed table cannot fall onto the zero form', () => {
      expect(pick('a | {count} b | {count} c | {count} d | {count} e', 1000000, 'br')).toBe('{count} e')
    })
  })

  describe('every locale with a zero category', () => {
    const zeroLocales = ['ar', 'ars', 'blo', 'cv', 'cy', 'ksh', 'kw', 'lag', 'lv', 'prg']

    it('the list is complete for this ICU', () => {
      const tags: string[] = []
      const letters = 'abcdefghijklmnopqrstuvwxyz'
      for (const a of letters) for (const b of letters) tags.push(a + b, ...[...letters].map((c) => a + b + c))
      const found = Intl.PluralRules.supportedLocalesOf(tags).filter((tag) => {
        const rules = new Intl.PluralRules(tag)
        return Array.from({ length: 200 }, (_, n) => rules.select(n)).includes('zero')
      })
      expect(found.toSorted()).toEqual(zeroLocales)
    })

    it.each(zeroLocales)('%s keeps a three-form zero-first template on the index rule', (locale) => {
      expect(picks('nav | viens | {count} āboli', [0, 1, 2, 10, 11, 19, 20, 21, 30, 100], locale)).toEqual([
        'nav',
        'viens',
        ...Array.from({ length: 8 }, () => '{count} āboli'),
      ])
    })

    it.each(['lv', 'prg'])('%s with the marker: 10 is not the zero form', (locale) => {
      const template = '=0 nav | {count} ābols | {count} āboli'
      expect(picks(template, [0, 1, 2, 10, 11, 21, 100], locale)).toEqual([
        'nav',
        '{count} ābols',
        '{count} āboli',
        '{count} āboli',
        '{count} āboli',
        '{count} ābols',
        '{count} āboli',
      ])
    })

    it.each(['lv', 'prg'])('%s with the marker and a form per category', (locale) => {
      expect(picks('=0 nav | {count} ābolu | {count} ābols | {count} āboli', [0, 10, 21, 22], locale)).toEqual([
        'nav',
        '{count} ābolu',
        '{count} ābols',
        '{count} āboli',
      ])
    })
  })

  describe('the =0 marker', () => {
    it('the zero form, then the rest by category, the last form taking what has no form of its own', () => {
      expect(picks('=0 нет | одно | много', [0, 1, 2, 5, 11, 21, 22], 'ru')).toEqual(['нет', 'одно', 'много', 'много', 'много', 'одно', 'много'])
    })

    it('a form per category', () => {
      expect(picks('=0 нет | яблоко | яблока | яблок', [0, 1, 2, 5, 21, 22, 25], 'ru')).toEqual([
        'нет',
        'яблоко',
        'яблока',
        'яблок',
        'яблоко',
        'яблока',
        'яблок',
      ])
    })

    it('works in a two-category locale', () => {
      expect(picks('=0 none | one | {count} many', [0, 1, 2, 21], 'en')).toEqual(['none', 'one', '{count} many', '{count} many'])
      expect(picks('=0 aucun | un | {count}', [0, 1, 2], 'fr')).toEqual(['aucun', 'un', '{count}'])
    })

    it('a category only a huge count reaches goes to the last form, or its own when written', () => {
      expect(pick('=0 aucun | un | {count}', 1000000, 'fr')).toBe('{count}')
      expect(pick('=0 aucun | un | des millions | {count}', 1000000, 'fr')).toBe('des millions')
      expect(pick('=0 aucun | un | des millions | {count}', 2, 'fr')).toBe('{count}')
    })

    it('ar: zero is the marked form, whichever way the rest are counted', () => {
      expect(picks('=0 z | a | b | c | d | e', [0, 1, 2, 3, 11, 100], 'ar')).toEqual(['z', 'a', 'b', 'c', 'd', 'e'])
    })

    it('a single form answers every count', () => {
      expect(picks('=0 only', [0, 1, 5], 'ru')).toEqual(['only', 'only', 'only'])
    })

    it.each([-1, 1.5, Number.NaN])('%d takes the last form', (count) => {
      expect(pick('=0 нет | одно | много', count, 'ru')).toBe('много')
    })

    it('without usable rules it falls back to the index rule, the marker removed', () => {
      expect(picks('=0 none | one | many', [0, 1, 2, 5], 'en_US')).toEqual(['none', 'one', 'many', 'many'])
    })

    it('only at the very start, followed by a space', () => {
      expect(pick('=0x | b', 0, 'en')).toBe('=0x')
      expect(pick(' =0 a | b', 0, 'en')).toBe('=0 a')
    })

    it('defaultPlural interpolates the form, with the marker gone', () => {
      expect(defaultPlural('k', 21, {}, 'ru', (() => '=0 нет | {count} яблоко | {count} яблок') as never)).toBe('21 яблоко')
      expect(defaultPlural('k', 0, {}, 'ru', (() => '=0 нет | {count} яблоко | {count} яблок') as never)).toBe('нет')
    })
  })

  describe('which rules a locale gets never depends on the host', () => {
    it.each(['ua', 'cz', 'jp', 'cn', 'xx', 'russian'])('%s is unknown to Intl: the index rule', (locale) => {
      const spy = vi.spyOn(Intl, 'PluralRules')
      expect(picks('a | {count} b | {count} c | {count} d', [0, 1, 2, 3, 21], locale)).toEqual([
        'a',
        '{count} b',
        '{count} c',
        '{count} d',
        '{count} d',
      ])
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  it('builds the rules of a locale once', () => {
    const spy = vi.spyOn(Intl, 'PluralRules')
    pick('a | b | c', 1, 'sk')
    pick('a | b | c', 2, 'sk')
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('the first 200 counts of a locale cost no Intl call', () => {
    pick('=0 a | b', 1, 'bs')
    const select = vi.spyOn(Intl.PluralRules.prototype, 'select')
    pick('=0 a | b | c', 21, 'bs')
    expect(select).not.toHaveBeenCalled()
    pick('=0 a | b | c', 1021, 'bs')
    expect(select).toHaveBeenCalledTimes(1)
    select.mockRestore()
  })
})

describe('resolveText', () => {
  const messages = {
    hi: 'Hello, {name}!',
    apples: 'none | one | {count} apples',
    ruApples: '=0 нет | яблоко | яблока | яблок',
    blank: '   ',
    sum: 'total {number}',
    when: 'on {date}',
    ago: 'was {relativeDate}',
    rich: '<b>{name}</b>',
    only: '{name}',
    tree: { a: 'b' },
    flag: true,
    total: 7,
  }
  const i18n = () => new TestI18n('en', messages)

  it('answers the raw template and its values', () => {
    expect(resolveText(i18n(), { keypath: 'hi', params: { name: '{link}' } })).toEqual({ template: 'Hello, {name}!', params: { name: '{link}' } })
  })

  it('picks the plural form before anything is interpolated', () => {
    expect(resolveText(i18n(), { keypath: 'apples', plural: 3 })).toEqual({ template: '{count} apples', params: { count: 3 } })
    expect(text(new TestI18n('ru', messages), { keypath: 'ruApples', plural: 21 })).toBe('яблоко')
    expect(text(new TestI18n('ru', messages), { keypath: 'ruApples', plural: 0 })).toBe('нет')
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

  it('hides what is blank once interpolated, and shows what a param fills', () => {
    expect(resolveText(i18n(), { keypath: 'only', hideIfEmpty: true, params: { name: '' } })).toBeNull()
    expect(resolveText(i18n(), { keypath: 'only', hideIfEmpty: true, params: { name: ' ' } })).toBeNull()
    expect(text(i18n(), { keypath: 'only', hideIfEmpty: true, params: { name: 'Z' } })).toBe('Z')
    expect(text(i18n(), { keypath: 'only', hideIfEmpty: true })).toBe('{name}')
  })

  it('plural on a value that is no text answers the key, as tc does', () => {
    expect(text(i18n(), { keypath: 'tree', plural: 2 })).toBe('tree')
    expect(text(i18n(), { keypath: 'flag', plural: 2 })).toBe('flag')
    expect(i18n().tc('tree', 2)).toBe('tree')
    expect(text(i18n(), { keypath: 'total', plural: 2 })).toBe('7')
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

  it('a param set to undefined stays a placeholder, as without html', () => {
    expect(text(i18n(), { keypath: 'rich', html: true, params: { name: undefined as never } })).toBe('<b>{name}</b>')
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

    it('sees the marker in the raw value: it is the rule that reads the forms', () => {
      const seen: unknown[] = []
      const reader: PluralFunc = (key, _count, _params, _locale, getter) => {
        seen.push(getter(key))
        return 'mine'
      }
      expect(new TestI18n('ru', messages, reader).tc('ruApples', 1)).toBe('mine')
      expect(text(new TestI18n('ru', messages), { keypath: 'ruApples', plural: 1, customPluralRule: reader })).toBe('mine')
      expect(seen).toEqual(['=0 нет | яблоко | яблока | яблок', '=0 нет | яблоко | яблока | яблок'])
    })

    it('null falls back to the default rule, the marker included', () => {
      const custom = new TestI18n('ru', messages, rule)
      expect(custom.tc('ruApples', 21)).toBe('яблоко')
      expect(text(custom, { keypath: 'ruApples', plural: 21 })).toBe('яблоко')
    })
  })
})

describe('the plural locale of an instance', () => {
  class IsoI18n extends BaseI18n {
    constructor(plural?: PluralFunc) {
      super({ plural, missingWarn: false, localeIso: { ua: 'uk-UA', de: 'de-DE' } })
      this.helper.loadTranslations('ua', { x: '=0 нема | {count} яблуко | {count} яблука | {count} яблук' } as never)
    }
    getLocale = () => 'ua'
    getFallbackLocale = () => 'ua'
    getRoute = () => 'index'
  }

  it('a code that is no language plurals by its iso', () => {
    expect(new IsoI18n().tc('x', 21)).toBe('21 яблуко')
    expect(new IsoI18n().tc('x', 22)).toBe('22 яблука')
    expect(text(new IsoI18n(), { keypath: 'x', plural: 21 })).toBe('21 яблуко')
  })

  it('a custom rule keeps getting the code, and its null falls back by iso', () => {
    const codes: string[] = []
    const rule: PluralFunc = (_k, _c, _p, locale) => {
      codes.push(locale)
      return null
    }
    expect(new IsoI18n(rule).tc('x', 21)).toBe('21 яблуко')
    expect(codes).toEqual(['ua'])
  })
})

describe('FormatService timeZone', () => {
  const noon = Date.UTC(2024, 0, 1, 23, 30)

  it('one zone gives one date, and a format can still pick its own', () => {
    const tokyo = new FormatService({ timeZone: 'Asia/Tokyo' })
    expect(tokyo.formatDate(noon, 'en')).toBe('1/2/2024')
    expect(tokyo.formatDate(noon, 'en', { timeZone: 'UTC' })).toBe('1/1/2024')
    const angeles = new FormatService({ timeZone: 'America/Los_Angeles' })
    expect(angeles.formatDate(Date.UTC(2024, 0, 2, 3), 'en', { timeZone: undefined })).toBe('1/1/2024')
  })
})
