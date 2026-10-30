/**
 * The `<i18n-t>` inputs of every framework's golden: one matrix, so drift between the renderers is
 * a visible diff. Slots are described, not built: each harness makes them with its own `h`.
 */
export const NOW = Date.UTC(2024, 5, 15, 12, 0, 0)

/** `[tag, text]` of an element standing in for a placeholder. */
export type SlotSpec = readonly [string, string]

export interface TCase {
  locale?: string
  props: Record<string, unknown>
  attrs?: Record<string, unknown>
  slots?: Record<string, SlotSpec>
  /** Wrap the translation in `<u>` through the default slot. */
  defaultSlot?: boolean
}

export const messages = {
  en: {
    plain: 'Hello',
    greeting: 'Hello, {name}!',
    repeat: '{a} and {a}',
    order: '{a} then {b}',
    reorder: '{b} then {a}',
    edges: '{a}{b}',
    rich: '<b>{n}</b> new',
    apples: 'no apples | one apple | {count} apples',
    cart: 'none | {count} item in {link} | {count} items in {link}',
    blank: '   ',
    empty: '',
    num: 'n={number}',
    numLink: 'n={number} {link}',
    dated: 'd={date}',
    rel: 'r={relativeDate}',
    uni: '{имя} {first-name}',
    proto: '{__proto__} {constructor} {toString}',
    nested: { deep: 'Deep {x}' },
    tree: { a: 'b' },
    count: 7,
  },
  de: { plain: 'Hallo', reorder: '{a} dann {b}' },
  ru: {
    apples: 'яблоко | яблока | яблок',
    zeroFirst: 'нет яблок | одно яблоко | {count} яблок',
    marked: '=0 нет | {count} яблоко | {count} яблока | {count} яблок',
  },
}

const slotA: SlotSpec = ['b', 'A']
const slotB: SlotSpec = ['i', 'B']
export const date = new Date(Date.UTC(2024, 0, 15, 12))
const rule = (key: string, count: number, params: object, locale: string, t: (k: string, p?: object) => unknown) =>
  `${locale}:${count}:${t(key)}:${JSON.stringify(params)}`

export const T_CASES: [string, TCase][] = [
  ['plain', { props: { keypath: 'plain' } }],
  ['missing', { props: { keypath: 'nope' } }],
  ['missing + defaultValue', { props: { keypath: 'nope', defaultValue: 'dv' } }],
  ['nested', { props: { keypath: 'nested.deep', params: { x: 1 } } }],
  ['object value', { props: { keypath: 'tree' } }],
  ['number value', { props: { keypath: 'count' } }],
  ['tag + attrs', { props: { keypath: 'plain', tag: 'p' }, attrs: { id: 'x', class: 'c' } }],
  ['params', { props: { keypath: 'greeting', params: { name: 'Z' } } }],
  ['param missing', { props: { keypath: 'greeting' } }],
  ['param looks like a slot', { props: { keypath: 'order', params: { a: '{b}' } }, slots: { b: slotB } }],
  ['param and slot same name', { props: { keypath: 'order', params: { a: 'P' } }, slots: { a: slotA } }],
  ['slots in order', { props: { keypath: 'order' }, slots: { a: slotA, b: slotB } }],
  ['slots reordered', { props: { keypath: 'reorder' }, slots: { a: slotA, b: slotB } }],
  ['slots repeated', { props: { keypath: 'repeat' }, slots: { a: slotA } }],
  ['slots at the edges', { props: { keypath: 'edges' }, slots: { a: slotA, b: slotB } }],
  ['unknown slot', { props: { keypath: 'order' }, slots: { z: slotA } }],
  [
    'default slot',
    { props: { keypath: 'greeting', params: { name: 'Z' } }, defaultSlot: true },
  ],
  ['unicode names, params', { props: { keypath: 'uni', params: { имя: 'И', 'first-name': 'F' } } }],
  ['unicode names, slots', { props: { keypath: 'uni' }, slots: { имя: slotA, 'first-name': slotB } }],
  ['proto, no params', { props: { keypath: 'proto' } }],
  ['proto, slots object has no such slot', { props: { keypath: 'proto' }, slots: { a: slotA } }],
  ['html', { props: { keypath: 'rich', html: true, params: { n: 3 } } }],
  ['html, hostile param', { props: { keypath: 'greeting', html: true, params: { name: '<img src=x onerror=alert(1)>' } } }],
  ['text, hostile param', { props: { keypath: 'greeting', params: { name: '<img src=x>' } } }],
  ['html ignores slots', { props: { keypath: 'order', html: true }, slots: { a: slotA } }],
  ['innerHTML attr', { props: { keypath: 'plain' }, attrs: { innerHTML: '<i>x</i>' } }],
  ['dangerouslySetInnerHTML attr', { props: { keypath: 'plain' }, attrs: { dangerouslySetInnerHTML: { __html: '<i>x</i>' } } }],
  ['textContent attr', { props: { keypath: 'plain' }, attrs: { textContent: 'x' } }],
  ['hideIfEmpty blank', { props: { keypath: 'blank', hideIfEmpty: true } }],
  ['hideIfEmpty blank + default', { props: { keypath: 'blank', hideIfEmpty: true, defaultValue: 'dv' } }],
  ['hideIfEmpty empty', { props: { keypath: 'empty', hideIfEmpty: true } }],
  ['hideIfEmpty number', { props: { keypath: 'blank', hideIfEmpty: true, number: 1 } }],
  ['hideIfEmpty plural', { props: { keypath: 'blank', hideIfEmpty: true, plural: 1 } }],
  ['blank shown', { props: { keypath: 'blank' } }],
  ['plural 0', { props: { keypath: 'apples', plural: 0 } }],
  ['plural 1', { props: { keypath: 'apples', plural: 1 } }],
  ['plural 5', { props: { keypath: 'apples', plural: 5 } }],
  ['plural "2"', { props: { keypath: 'apples', plural: '2' } }],
  ['plural 1.5', { props: { keypath: 'apples', plural: 1.5 } }],
  ['plural "abc"', { props: { keypath: 'apples', plural: 'abc' } }],
  ['plural null', { props: { keypath: 'apples', plural: null } }],
  ['plural + slot', { props: { keypath: 'cart', plural: 2 }, slots: { link: slotA } }],
  ['plural + html', { props: { keypath: 'rich', plural: 2, html: true, params: { n: '<i>' } } }],
  ['plural missing + default', { props: { keypath: 'nope', plural: 2, defaultValue: 'dv' } }],
  ['plural ru 1', { locale: 'ru', props: { keypath: 'apples', plural: 1 } }],
  ['plural ru 2', { locale: 'ru', props: { keypath: 'apples', plural: 2 } }],
  ['plural ru 5', { locale: 'ru', props: { keypath: 'apples', plural: 5 } }],
  ['plural ru 21', { locale: 'ru', props: { keypath: 'apples', plural: 21 } }],
  ['plural ru zero-first 0', { locale: 'ru', props: { keypath: 'zeroFirst', plural: 0 } }],
  ['plural ru zero-first 1', { locale: 'ru', props: { keypath: 'zeroFirst', plural: 1 } }],
  ['plural ru zero-first 21', { locale: 'ru', props: { keypath: 'zeroFirst', plural: 21 } }],
  ['plural ru marked 0', { locale: 'ru', props: { keypath: 'marked', plural: 0 } }],
  ['plural ru marked 21', { locale: 'ru', props: { keypath: 'marked', plural: 21 } }],
  ['plural ru marked 22', { locale: 'ru', props: { keypath: 'marked', plural: 22 } }],
  ['customPluralRule marked', { locale: 'ru', props: { keypath: 'marked', plural: 1, customPluralRule: rule } }],
  ['customPluralRule', { props: { keypath: 'apples', plural: 4, params: { p: 1 }, customPluralRule: rule } }],
  ['customPluralRule null', { props: { keypath: 'apples', plural: 4, customPluralRule: () => null } }],
  ['customPluralRule miss', { props: { keypath: 'nope', plural: 4, customPluralRule: rule } }],
  ['customPluralRule fraction', { props: { keypath: 'apples', plural: 1.5, customPluralRule: rule } }],
  ['customPluralRule html', { props: { keypath: 'apples', plural: 1, html: true, customPluralRule: () => '<b>x</b>' } }],
  ['number', { props: { keypath: 'num', number: 1500 } }],
  ['number string', { props: { keypath: 'num', number: '1500' } }],
  ['number null', { props: { keypath: 'plain', number: null } }],
  ['number + same-name param', { props: { keypath: 'num', number: 5, params: { number: 'PARAM' } } }],
  ['number + slot', { props: { keypath: 'numLink', number: 5 }, slots: { link: slotA } }],
  ['date', { props: { keypath: 'dated', date } }],
  ['date null', { props: { keypath: 'plain', date: null } }],
  ['date + same-name param', { props: { keypath: 'dated', date, params: { date: 'PARAM' } } }],
  ['relativeDate', { props: { keypath: 'rel', relativeDate: new Date(NOW - 7200_000) } }],
  ['relativeDate null', { props: { keypath: 'plain', relativeDate: null } }],
  ['precedence number over plural', { props: { keypath: 'num', number: 2, plural: 1 } }],
]
