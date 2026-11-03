// One catalogue for every framework playground: the dictionaries, and the calls whose result each page prints as
// `<li data-testid="id">value</li>`. Same ids everywhere, so two runs (or two frameworks) compare row by row.

export type Dictionary = Record<string, unknown>

/** What the catalogue calls: every framework's `useI18n()` has this shape. */
export interface I18nLike {
  t: (key: string, params?: Record<string, unknown>, defaultValue?: string | null, routeContext?: unknown) => unknown
  ts: (key: string, params?: Record<string, unknown>, defaultValue?: string, routeContext?: unknown) => string
  tc: (key: string, count: number | Record<string, unknown>, defaultValue?: string) => string
  // oxlint-disable-next-line typescript/no-explicit-any -- each framework types these overloads its own way
  tn: (value: number, ...rest: any[]) => string
  // oxlint-disable-next-line typescript/no-explicit-any -- as above
  td: (value: Date | number | string, ...rest: any[]) => string
  tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string
  has: (key: string, routeContext?: unknown) => boolean
}

export type Case = readonly [id: string, run: (i18n: I18nLike) => unknown]

/** `pt` has a partial dictionary, `es` none, `xx-bad_tag` is no language tag: fallback chains and edge tags. */
export const locales = [
  { code: 'en', dir: 'ltr', iso: 'en-US', name: 'English' },
  { code: 'de', dir: 'ltr', iso: 'de-DE', name: 'Deutsch' },
  { code: 'fr', dir: 'ltr', iso: 'fr-FR', name: 'Français' },
  { code: 'ru', dir: 'ltr', iso: 'ru-RU', name: 'Русский' },
  { code: 'ar', dir: 'rtl', iso: 'ar-EG', name: 'العربية' },
  { code: 'pt', dir: 'ltr', iso: 'pt-BR', name: 'Português' },
  { code: 'es', dir: 'ltr', iso: 'es-ES', name: 'Español' },
]

export const localeCodes = locales.map((locale) => locale.code)

const prose = (greeting: string, welcome: string, apples: string, deep: string, list: string[], nested: string) => ({
  greeting: `${greeting}, {name}!`,
  welcome,
  apples,
  two: '{a} / {b} / {a}',
  html: '<b>{name}</b>',
  section: { title: nested, deep: { er: { value: deep } } },
  stats: 'n={number} d={date} r={relativeDate}',
  list,
})

export const messages: Record<string, Dictionary> = {
  en: {
    ...prose('Hello', 'Welcome', 'no apples | one apple | {count} apples', 'deep en', ['one', 'two', 'three'], 'Section'),
    'dotted.key': 'flat dotted key',
    only: { en: 'only in en' },
    marker: '=0 none | {count} item | {count} items',
    empty: '',
    zero: 0,
    off: false,
    constructor: 'own constructor',
    unicode: 'Ключ → {имя} 🎉',
    braces: 'a { b } {c}',
    pipe: 'solid | form',
  },
  de: prose('Hallo', 'Willkommen', 'keine Äpfel | ein Apfel | {count} Äpfel', 'tief de', ['eins', 'zwei', 'drei'], 'Abschnitt'),
  fr: prose('Bonjour', 'Bienvenue', 'pas de pomme | une pomme | {count} pommes', 'profond fr', ['un', 'deux', 'trois'], 'Section fr'),
  ru: prose('Привет', 'Добро пожаловать', '{count} яблоко | {count} яблока | {count} яблок', 'глубоко', ['раз', 'два', 'три'], 'Раздел'),
  ar: prose('مرحبا', 'أهلا', 'لا تفاح | تفاحة | تفاحتان | {count} تفاحات | {count} تفاحة | {count} تفاحة', 'عميق', ['واحد', 'اثنان', 'ثلاثة'], 'قسم'),
  pt: { greeting: 'Olá, {name}!', section: { title: 'Seção' } },
}

export const routeMessages: Record<string, Record<string, Dictionary>> = {
  home: {
    en: { title: 'Home', page: { only: 'home only en' }, welcome: 'Welcome home' },
    de: { title: 'Startseite', page: { only: 'nur Start de' } },
    fr: { title: 'Accueil' },
    ru: { title: 'Главная' },
    ar: { title: 'الرئيسية' },
  },
  about: {
    en: { title: 'About', visits: 'no visits | {count} visit | {count} visits' },
    de: { title: 'Über uns', visits: 'keine Besuche | {count} Besuch | {count} Besuche' },
  },
}

export const numberFormats = {
  en: { currency: { style: 'currency', currency: 'USD' }, percent: { style: 'percent' } },
  de: { currency: { style: 'currency', currency: 'EUR' }, percent: { style: 'percent' } },
  fr: { currency: { style: 'currency', currency: 'EUR' } },
  ru: { currency: { style: 'currency', currency: 'RUB' } },
  ar: { currency: { style: 'currency', currency: 'EGP' } },
} as const

export const datetimeFormats = {
  en: { short: { dateStyle: 'short' }, long: { dateStyle: 'long', timeStyle: 'short' } },
  de: { short: { dateStyle: 'short' }, long: { dateStyle: 'long', timeStyle: 'short' } },
  fr: { short: { dateStyle: 'short' } },
  ru: { short: { dateStyle: 'short' } },
  ar: { short: { dateStyle: 'short' } },
} as const

export const instanceOptions = {
  fallbackLocale: 'en',
  missingWarn: false,
  numberFormats,
  datetimeFormats,
  timeZone: 'UTC',
}

const DAY = Date.UTC(2024, 0, 15, 12, 30)
const HOUR_MS = 3_600_000

export const cases: Case[] = [
  ['t-basic', (i) => i.t('welcome')],
  ['t-param', (i) => i.t('greeting', { name: 'Ada' })],
  ['t-param-absent', (i) => i.t('greeting')],
  ['t-param-other', (i) => i.t('greeting', { other: 1 })],
  ['t-param-repeated', (i) => i.t('two', { a: 1, b: 'x' })],
  ['t-param-html', (i) => i.t('html', { name: '<i>&' })],
  ['t-param-zero', (i) => i.t('greeting', { name: 0 })],
  ['t-param-null', (i) => i.t('greeting', { name: null })],
  ['t-unicode-param', (i) => i.t('unicode', { имя: 'Ада' })],
  ['t-braces', (i) => i.t('braces', { c: 1, b: 2 })],
  ['t-nested', (i) => i.t('section.title')],
  ['t-nested-deep', (i) => i.t('section.deep.er.value')],
  ['t-subtree', (i) => i.t('section.deep')],
  ['t-array', (i) => i.t('list')],
  ['t-array-index', (i) => i.t('list.1')],
  ['t-dotted-key', (i) => i.t('dotted.key')],
  ['t-empty-key', (i) => i.t('')],
  ['t-empty-value', (i) => i.t('empty')],
  ['t-zero-value', (i) => i.t('zero')],
  ['t-false-value', (i) => i.t('off')],
  ['t-fallback', (i) => i.t('only.en')],
  ['t-missing', (i) => i.t('no.such.key')],
  ['t-missing-default', (i) => i.t('no.such.key', undefined, 'Default')],
  ['t-missing-default-param', (i) => i.t('no.such.key', { name: 'Ada' }, 'Hi {name}')],
  ['t-missing-default-null', (i) => i.t('no.such.key', undefined, null)],
  ['t-missing-default-empty', (i) => i.t('no.such.key', undefined, '')],
  ['t-proto', (i) => i.t('__proto__')],
  ['t-proto-path', (i) => i.t('__proto__.polluted')],
  ['t-constructor', (i) => i.t('constructor')],
  ['t-toString', (i) => i.t('toString')],
  ['t-route-title', (i) => i.t('title', undefined, undefined, 'home')],
  ['t-route-override', (i) => i.t('welcome', undefined, undefined, 'home')],
  ['t-route-root-key', (i) => i.t('greeting', { name: 'Ada' }, undefined, 'home')],
  ['t-route-own-nested', (i) => i.t('page.only', undefined, undefined, 'home')],
  ['t-route-other', (i) => i.t('title', undefined, undefined, 'about')],
  ['t-route-unknown', (i) => i.t('title', undefined, undefined, 'no-such-route')],
  ['ts-basic', (i) => i.ts('welcome')],
  ['ts-subtree', (i) => i.ts('section.deep')],
  ['ts-array', (i) => i.ts('list')],
  ['ts-missing', (i) => i.ts('no.such.key')],
  ['ts-missing-default', (i) => i.ts('no.such.key', undefined, 'Default')],
  ['ts-zero-value', (i) => i.ts('zero')],
  ...[0, 1, 2, 3, 5, 11, 21, 22, 100, 101, 1.5, -1].map((n): Case => [`tc-${n}`, (i) => i.tc('apples', n)]),
  ['tc-params', (i) => i.tc('apples', { count: 3, extra: 'x' })],
  ['tc-no-count', (i) => i.tc('apples', {})],
  ['tc-marker-0', (i) => i.tc('marker', 0)],
  ['tc-marker-1', (i) => i.tc('marker', 1)],
  ['tc-marker-2', (i) => i.tc('marker', 2)],
  ['tc-one-form', (i) => i.tc('pipe', 7)],
  ['tc-not-plural', (i) => i.tc('welcome', 5)],
  ['tc-missing', (i) => i.tc('no.such.key', 2)],
  ['tc-missing-default', (i) => i.tc('no.such.key', 2, '{count} things')],
  ['tc-route-key', (i) => i.tc('visits', 2)],
  ['tn-int', (i) => i.tn(1234567)],
  ['tn-fraction', (i) => i.tn(1234.5678)],
  ['tn-negative', (i) => i.tn(-1000.5)],
  ['tn-zero', (i) => i.tn(0)],
  ['tn-huge', (i) => i.tn(1e21)],
  ['tn-nan', (i) => i.tn(Number.NaN)],
  ['tn-infinity', (i) => i.tn(Number.POSITIVE_INFINITY)],
  ['tn-options', (i) => i.tn(0.256, { style: 'percent', maximumFractionDigits: 1 })],
  ['tn-named', (i) => i.tn(1234.5, 'currency')],
  ['tn-named-percent', (i) => i.tn(0.5, 'percent')],
  ['tn-named-unknown', (i) => i.tn(1234.5, 'nope')],
  ['tn-named-override', (i) => i.tn(1234.5, 'currency', { maximumFractionDigits: 0 })],
  ['tn-named-locale', (i) => i.tn(1234.5, 'currency', 'de')],
  ['td-number', (i) => i.td(DAY)],
  ['td-date', (i) => i.td(new Date(DAY))],
  ['td-iso', (i) => i.td('2024-01-15T12:30:00.000Z')],
  ['td-invalid', (i) => i.td('not a date')],
  ['td-nan', (i) => i.td(Number.NaN)],
  ['td-options', (i) => i.td(DAY, { month: 'long', day: 'numeric', timeZone: 'UTC' })],
  ['td-named-short', (i) => i.td(DAY, 'short')],
  ['td-named-long', (i) => i.td(DAY, 'long')],
  ['td-named-unknown', (i) => i.td(DAY, 'nope')],
  ['td-named-locale', (i) => i.td(DAY, 'short', 'de')],
  ['tdr-hour', (i) => i.tdr(Date.now() - HOUR_MS * 1.5)],
  ['tdr-days', (i) => i.tdr(Date.now() - HOUR_MS * 73)],
  ['tdr-future', (i) => i.tdr(Date.now() + HOUR_MS * 49)],
  ['tdr-invalid', (i) => i.tdr('not a date')],
  ['tdr-options', (i) => i.tdr(Date.now() - HOUR_MS * 25, { numeric: 'auto', style: 'short' })],
  ['has-key', (i) => i.has('welcome')],
  ['has-nested', (i) => i.has('section.deep.er.value')],
  ['has-subtree', (i) => i.has('section')],
  ['has-missing', (i) => i.has('no.such.key')],
  ['has-fallback', (i) => i.has('only.en')],
  ['has-route', (i) => i.has('title', 'home')],
  ['has-route-root', (i) => i.has('welcome', 'about')],
  ['has-proto', (i) => i.has('__proto__')],
]

export const show = (value: unknown): string => (typeof value === 'string' ? value : (JSON.stringify(value) ?? String(value)))

/** The row's text. A call that throws is a result too: a fixed text instead of a broken page. */
export function row(run: () => unknown): string {
  try {
    return show(run())
  } catch (error) {
    return `throws: ${(error as Error).message}`
  }
}

export interface Row {
  id: string
  value: string
}

export const caseRows = (i18n: I18nLike): Row[] => cases.map(([id, run]) => ({ id, value: row(() => run(i18n)) }))

/** A dictionary of `size` keys in sections of 50, for the big page and memory runs. */
export function bigMessages(size: number, label: string): Dictionary {
  const out: Record<string, Record<string, string>> = {}
  for (let n = 0; n < size; n++) {
    const section = `s${Math.floor(n / 50)}`
    out[section] ??= {}
    out[section][`k${n % 50}`] = `${label} ${n} {x}`
  }
  return { big: out }
}

export const bigKey = (n: number): string => `big.s${Math.floor(n / 50)}.k${n % 50}`

/** Page paths of the SPA playgrounds, without the locale prefix. */
export const pagePaths = ['/', '/components', '/dictionaries', '/routing', '/big']

export const fetchDictionary = async (path: string): Promise<Dictionary> => {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return (await response.json()) as Dictionary
}

export const lazyUrl = (locale: string): string => `/lazy/${locale}.json`
export const pageUrl = (locale: string): string => `/pages/dictionaries/${locale}.json`

export const BIG_KEYS = 5000
export const BIG_ROWS = 2000
export const bigRows = Array.from({ length: BIG_ROWS }, (_, n) => n)

/** What a page needs of `localStorage`, safe on a server and in a private window. */
export const persisted = {
  read(): string | null {
    try {
      return globalThis.localStorage?.getItem('bench-locale') ?? null
    } catch {
      return null
    }
  },
  write(locale: string): void {
    try {
      globalThis.localStorage?.setItem('bench-locale', locale)
    } catch {
      // no storage: nothing to remember
    }
  },
}

/** `/de/about?x=1` → `de`; no locale prefix is the default locale. */
export const localeOfPath = (path: string): string => {
  const first = path.split(/[/?#]/)[1] ?? ''
  return localeCodes.includes(first) ? first : 'en'
}

export const dirOf = (code: string): string => locales.find((locale) => locale.code === code)?.dir ?? 'ltr'

/** The route name a path's dictionary goes by: `/de/routing` → `routing`, the root → `home`. */
export const routeOfPath = (path: string): string => {
  const parts = path.split(/[?#]/)[0]!.split('/').filter(Boolean)
  if (localeCodes.includes(parts[0] ?? '')) parts.shift()
  return parts[0] ?? 'home'
}

/** What the routing page prints: the same calls in every framework. */
export interface RoutingApi {
  localePath: (to: never, locale?: string) => string
  localeRoute: (to: never, locale?: string) => unknown
  getLocales: () => Array<{ code: string }>
  defaultLocale: () => string
}

export const routingRows = ({ localePath, localeRoute, getLocales, defaultLocale }: RoutingApi): Row[] => {
  const list: Array<[string, () => unknown]> = [
    ['path-string', () => localePath('/x' as never)],
    ['path-de', () => localePath('/x' as never, 'de')],
    ['path-en', () => localePath('/x' as never, 'en')],
    ['path-object', () => localePath({ path: '/x' } as never, 'de')],
    ['path-query', () => localePath('/x?a=1#b' as never, 'de')],
    ['path-root', () => localePath('/' as never, 'de')],
    ['path-prefixed', () => localePath('/de/x' as never, 'fr')],
    ['route-object', () => localeRoute('/x' as never, 'de')],
    ['locales', () => getLocales().map((item) => item.code)],
    ['default-locale', () => defaultLocale()],
  ]
  return list.map(([id, run]) => ({ id, value: row(run) }))
}
