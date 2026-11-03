/** Dictionaries shaped like real locale files: nested namespaces, flat dotted keys, plurals, odd leaves. */

export function enRoot(): Record<string, unknown> {
  return {
    greeting: 'Hello, {name}!',
    farewell: 'Bye',
    empty: '',
    zero: 0,
    yes: true,
    nothing: null,
    list: ['a', 'b'],
    'flat.dotted': 'flat value',
    flat: { dotted: 'nested value', other: 'nested other' },
    nav: { home: 'Home', about: 'About us', deep: { leaf: 'Deep leaf', tpl: '{a}-{b}-{a}' } },
    apples: 'no apples | one apple | {count} apples',
    cars: 'car|cars',
    items: '{count} item | {count} items for {name}',
    single: 'only one form',
    spaced: '{ name } stays',
    braces: 'json {"a":1} and {missing} and {name}',
    constructor: 'ctor text',
    unicode: { ключ: 'значение', '😀': 'smile' },
    shadow: 'scalar in en',
    onlyEn: 'english only',
  }
}

export function deRoot(): Record<string, unknown> {
  return {
    greeting: 'Hallo, {name}!',
    nav: { home: 'Startseite', deep: { leaf: 'Tiefes Blatt' } },
    apples: 'keine Äpfel | ein Apfel | {count} Äpfel',
    nothing: 'de has it',
    shadow: { child: 'object in de' },
    onlyDe: 'nur deutsch',
  }
}

export function enAbout(): Record<string, unknown> {
  return {
    title: 'About page',
    nav: { about: 'About (page)' },
    greeting: 'Hi from about, {name}',
  }
}

export function deAbout(): Record<string, unknown> {
  return { title: 'Über uns', nav: { about: 'Über (Seite)' } }
}

/** Keys every lookup scenario walks. */
export const KEYS = [
  'greeting',
  'farewell',
  'empty',
  'zero',
  'yes',
  'nothing',
  'list',
  'flat.dotted',
  'flat.other',
  'flat',
  'nav',
  'nav.home',
  'nav.about',
  'nav.deep.leaf',
  'nav.deep.tpl',
  'nav.home.x',
  'nav.',
  '.nav',
  'nav..home',
  'apples',
  'items',
  'constructor',
  'toString',
  '__proto__',
  'hasOwnProperty',
  'unicode.ключ',
  'unicode.😀',
  'shadow',
  'shadow.child',
  'onlyEn',
  'onlyDe',
  'title',
  'missing',
  'missing.deep',
]

export const PARAMS = [undefined, { name: 'Ann' }, { name: 'Ann', a: 1, b: 2, count: 7 }, {}]

export const COUNTS: unknown[] = [
  0,
  1,
  2,
  5,
  21,
  -1,
  1.5,
  2.9,
  Number.NaN,
  Infinity,
  '3',
  '0',
  'abc',
  { count: 2 },
  { count: 2, name: 'Bob' },
  { name: 'no count' },
  { count: 0 },
]
