/**
 * Characterization scenarios for @i18n-micro/core: each returns a markdown report of what the
 * public API answers. Written against the package exactly as adapters (vue, runtime, solid,
 * astro, node, test-utils) and the Nuxt runtime use it.
 */
import type { PluralFunc, Translations } from '@i18n-micro/types'
import {
  BaseI18n,
  createReactiveI18nStore,
  defaultPlural,
  FormatService,
  getByPath,
  hasTranslationValue,
  interpolate,
  isNoPrefixStrategy,
  isPrefixAndDefaultStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixStrategy,
  collectTranslationPaths,
  mergeTranslationChunk,
  mergeTranslationLayers,
  resolveTranslation,
  setTranslationAtKey,
  translationCacheKey,
  useTranslationHelper,
  withPrefixStrategy,
  type BaseI18nOptions,
  type TranslationStorage,
} from '../../src/index'
import {
  buildInspectorState,
  buildInspectorTree,
  countTranslationKeys,
  decodeInspectorPath,
  encodeInspectorPath,
  flattenTranslationNode,
  getByInspectorPath,
  parseInspectorNodeId,
} from '../../src/devtools-entry'
import { COUNTS, deAbout, deRoot, enAbout, enRoot, KEYS, PARAMS } from './fixtures'
import { Recorder, show } from './record'

/** The adapter shape every framework package builds: plain fields behind the abstract getters. */
export class TestI18n extends BaseI18n {
  locale: string
  fallback: string
  route = 'index'
  changes = 0

  constructor(locale: string, fallback = locale, options: BaseI18nOptions = {}) {
    super(options)
    this.locale = locale
    this.fallback = fallback
  }

  getLocale() {
    return this.locale
  }
  getFallbackLocale() {
    return this.fallback
  }
  getRoute() {
    return this.route
  }
  protected override onTranslationsChanged() {
    this.changes++
  }
}

function loaded(options: BaseI18nOptions = {}): TestI18n {
  const i18n = new TestI18n('en', 'en', { missingWarn: false, ...options })
  i18n.loadTranslationsCore('en', enRoot() as Translations, true)
  i18n.loadTranslationsCore('de', deRoot() as Translations, true)
  i18n.loadRouteTranslationsCore('en', 'about', enAbout() as Translations, false)
  i18n.loadRouteTranslationsCore('de', 'about', deAbout() as Translations, false)
  return i18n
}

const ROUTE_CONTEXTS: unknown[] = [undefined, 'index', 'about', 'nope', { name: 'about' }, null]

export function helpersReport(): string {
  const r = new Recorder()

  r.section('interpolate')
  const templates = ['Hello, {name}!', '{a}-{b}-{a}', 'no tokens', '', '{ name }', '{name', 'name}', '{}', '{na-me}', '{0} {1}', '{count} of {total}', '{name}{name}', 'x {constructor} {toString} {__proto__}']
  const params: unknown[] = [undefined, {}, { name: 'Ann' }, { name: 0 }, { name: null }, { name: false }, { a: 'A', b: 'B', count: 3, total: 9, 0: 'zero', 1: 'one' }, { name: { nested: true } }, { name: ['x', 'y'] }]
  for (const t of templates) for (const p of params) r.run(`interpolate(${show(t)}, ${show(p)})`, () => interpolate(t, p as never))

  r.section('getByPath / resolveTranslation / hasTranslationValue')
  const root = enRoot()
  for (const key of KEYS) {
    r.run(`getByPath(en, ${show(key)})`, () => getByPath(root, key))
    r.run(`resolveTranslation(en, ${show(key)})`, () => resolveTranslation(root, key))
    r.run(`hasTranslationValue(en, ${show(key)})`, () => hasTranslationValue(root, key))
  }
  r.run('getByPath(null, "a")', () => getByPath(null, 'a'))
  r.run('getByPath(undefined, "a")', () => getByPath(undefined, 'a'))
  r.run('getByPath({}, "")', () => getByPath({}, ''))
  r.run('getByPath({a:"x"}, 1 as any)', () => getByPath({ a: 'x' }, 1 as never))
  r.run('getByPath({a:{b:"s"}}, "a.b.length")', () => getByPath({ a: { b: 's' } }, 'a.b.length'))
  r.run('getByPath({a:["x","y"]}, "a.1")', () => getByPath({ a: ['x', 'y'] }, 'a.1'))
  r.run('getByPath(Object.create({inh:"x"}), "inh")', () => getByPath(Object.create({ inh: 'x' }), 'inh'))
  r.run('resolveTranslation(null, "a")', () => resolveTranslation(null, 'a'))

  r.section('setTranslationAtKey')
  const writes: Array<[string, unknown]> = [
    ['greeting', 'Yo'],
    ['nav', { only: 'x' }],
    ['nav.home', 'H'],
    ['nav.deep.leaf', 1],
    ['nav.new.path', 'n'],
    ['greeting.sub', 'turns string into object'],
    ['flat.dotted', 'updates flat key'],
    ['list.0', 'z'],
    ['', 'ignored'],
    ['__proto__', 'bad'],
    ['a.__proto__.b', 'bad'],
    ['constructor', 'ok'],
    ['nav..home', 'empty segment'],
    ['.lead', 'lead'],
    ['trail.', 'trail'],
  ]
  for (const [key, value] of writes) {
    const tree = enRoot()
    const before = JSON.stringify(tree)
    const out = r.run(`setTranslationAtKey(en, ${show(key)}, ${show(value)}) → changed paths`, () => {
      const next = setTranslationAtKey(tree, key, value)
      return { same: next === tree, value: getByPath(next, key), navSame: next.nav === tree.nav }
    })
    void out
    r.value(`  input untouched`, JSON.stringify(tree) === before)
  }

  r.section('mergeTranslationChunk')
  const merges: Array<[string, () => Record<string, unknown>, () => Record<string, unknown>]> = [
    ['en ← de', enRoot, deRoot],
    ['de ← en', deRoot, enRoot],
    ['{} ← en', () => ({}), enRoot],
    ['en ← {}', enRoot, () => ({})],
    ['arrays replace', () => ({ list: ['a', 'b'], n: { x: 1 } }), () => ({ list: ['c'], n: 'flat' })],
    ['type change', () => ({ a: 'str' }), () => ({ a: { b: 'obj' } })],
    ['null leaf', () => ({ a: 'x', b: { c: 1 } }), () => ({ a: null, b: null })],
    ['__proto__ json', () => ({ a: 1 }), () => JSON.parse('{"__proto__":{"polluted":true},"b":2}')],
    ['constructor key', () => ({ constructor: { a: 1 } }), () => ({ constructor: { b: 2 } })],
  ]
  for (const [label, a, b] of merges) {
    for (const preserveExisting of [false, true]) {
      const existing = a()
      const incoming = b()
      const eBefore = JSON.stringify(existing)
      const iBefore = JSON.stringify(incoming)
      r.run(`merge ${label} preserve=${preserveExisting}`, () => {
        const out = mergeTranslationChunk(existing, incoming, { preserveExisting })
        return { out, returnsIncoming: out === incoming, returnsExisting: out === existing }
      })
      r.value('  existing untouched', JSON.stringify(existing) === eBefore)
      r.value('  incoming untouched', JSON.stringify(incoming) === iBefore)
      r.value('  prototype clean', ({} as Record<string, unknown>).polluted === undefined)
    }
  }

  r.section('mergeTranslationLayers')
  r.run('layers(en, de)', () => mergeTranslationLayers(enRoot(), deRoot()))
  r.run('layers(de, en)', () => mergeTranslationLayers(deRoot(), enRoot()))
  r.run('layers(en, enAbout)', () => mergeTranslationLayers(enRoot(), enAbout()))
  r.run('layers({}, {})', () => mergeTranslationLayers({}, {}))
  r.run('layers scalar hides deep object', () => mergeTranslationLayers({ a: { b: { c: 1, d: [1] } } }, { a: 'scalar' }))
  r.run('layers null/undefined above fall through', () => mergeTranslationLayers({ a: 'low', b: { c: 1 } }, { a: null, b: undefined, d: undefined }))
  r.run('layers __proto__', () => mergeTranslationLayers(JSON.parse('{"__proto__":{"x":1},"a":1}'), JSON.parse('{"__proto__":{"y":1},"b":2}')))

  r.section('collectTranslationPaths')
  for (const [label, tree] of [
    ['en', enRoot()],
    ['de', deRoot()],
    ['proto', JSON.parse('{"__proto__":{"x":1},"a":{"b":[{"c":1}]}}')],
  ] as const) {
    const paths = new Set<string>()
    collectTranslationPaths(tree as Record<string, unknown>, paths)
    r.value(`paths(${label})`, [...paths])
  }

  r.section('strategy predicates / translationCacheKey')
  for (const s of ['prefix', 'prefix_except_default', 'prefix_and_default', 'no_prefix'] as const) {
    r.value(`${s}`, {
      with: withPrefixStrategy(s),
      no: isNoPrefixStrategy(s),
      prefix: isPrefixStrategy(s),
      except: isPrefixExceptDefaultStrategy(s),
      and: isPrefixAndDefaultStrategy(s),
    })
  }
  for (const [l, route] of [['en', undefined], ['en', ''], ['en', 'about'], ['de-AT', 'a:b']] as const) r.run(`translationCacheKey(${show(l)}, ${show(route)})`, () => translationCacheKey(l, route))

  r.section('defaultPlural')
  const forms = ['no apples | one apple | {count} apples', 'car|cars', 'only', '', '|', ' a | | c ', '{count} item | {count} items for {name}']
  for (const form of forms)
    for (const count of [0, 1, 2, 3, 10, -1, 1.5, Number.NaN]) {
      const getter = (() => form) as never
      r.run(`defaultPlural(${show(form)}, ${show(count)}, {name:"Z"})`, () => defaultPlural('k', count, { name: 'Z' }, 'en', getter))
    }
  r.run('defaultPlural(missing)', () => defaultPlural('k', 1, {}, 'en', (() => undefined) as never))
  r.run('defaultPlural(number value)', () => defaultPlural('k', 1, {}, 'en', (() => 12) as never))
  r.run('defaultPlural(object value)', () => defaultPlural('k', 1, {}, 'en', (() => ({ a: 1 })) as never))

  return r.toString()
}

export function i18nReport(): string {
  const r = new Recorder()
  const contexts: Array<[string, string, string]> = [
    ['en', 'en', 'index'],
    ['de', 'en', 'index'],
    ['de', 'de', 'index'],
    ['de', 'en', 'about'],
    ['en', 'de', 'about'],
    ['en', 'en', 'nope'],
    ['fr', 'en', 'index'],
    ['fr', 'fr', 'index'],
  ]

  for (const [locale, fallback, route] of contexts) {
    const i18n = loaded()
    i18n.locale = locale
    i18n.fallback = fallback
    i18n.route = route
    r.section(`lookups · locale=${locale} fallback=${fallback} route=${route}`)
    for (const key of KEYS) {
      r.run(`t(${show(key)})`, () => i18n.t(key))
      r.run(`has(${show(key)})`, () => i18n.has(key))
    }
    for (const key of ['greeting', 'nav.deep.tpl', 'braces', 'missing', 'zero', 'list'])
      for (const p of PARAMS) {
        r.run(`t(${show(key)}, ${show(p)})`, () => i18n.t(key, p as never))
        r.run(`ts(${show(key)}, ${show(p)})`, () => i18n.ts(key, p as never))
      }
    for (const dv of [undefined, null, '', 'dv'] as const) {
      r.run(`t("missing", undefined, ${show(dv)})`, () => i18n.t('missing', undefined, dv))
      r.run(`t("greeting", undefined, ${show(dv)})`, () => i18n.t('greeting', undefined, dv))
      r.run(`ts("missing", undefined, ${show(dv)})`, () => i18n.ts('missing', undefined, dv ?? undefined))
    }
    for (const ctx of ROUTE_CONTEXTS)
      for (const key of ['title', 'nav.about', 'greeting', 'onlyEn', 'missing']) {
        r.run(`t(${show(key)}, {name:"R"}, undefined, ${show(ctx)})`, () => i18n.t(key, { name: 'R' }, undefined, ctx))
        r.run(`has(${show(key)}, ${show(ctx)})`, () => i18n.has(key, ctx))
      }
    for (const key of ['apples', 'cars', 'items', 'single', 'missing', 'zero', 'empty'])
      for (const count of COUNTS) r.run(`tc(${show(key)}, ${show(count)})`, () => i18n.tc(key, count as never))
    r.run('tc("missing", 2, "dv")', () => i18n.tc('missing', 2, 'dv'))
    r.run('tc("apples", {name:"x"}, "dv")', () => i18n.tc('apples', { name: 'x' } as never, 'dv'))
    r.run('t("")', () => i18n.t(''))
    r.run('t(0 as any)', () => i18n.t(0 as never))
    r.run('t(42 as any)', () => i18n.t(42 as never))
    r.run('resolveTranslations()', () => i18n.resolveTranslations())
    r.run('resolveTranslations("about")', () => i18n.resolveTranslations('about'))
  }

  r.section('missing handlers')
  {
    const calls: unknown[] = []
    const i18n = loaded({ missingHandler: (...args) => calls.push(['handler', ...args]) })
    i18n.t('nope1')
    i18n.t('nope2', { a: 1 }, 'dv', 'about')
    i18n.tc('nope3', 2)
    i18n.has('nope4')
    i18n.ts('nope5')
    r.value('missingHandler calls', calls)
    let custom: ((...a: unknown[]) => void) | null = (...args) => calls.push(['custom', ...args])
    const i18n2 = loaded({ missingHandler: (...args) => calls.push(['handler', ...args]), getCustomMissingHandler: () => custom as never })
    calls.length = 0
    i18n2.t('nope6')
    custom = null
    i18n2.t('nope7')
    r.value('custom then handler', calls)
  }
  {
    const warnings: unknown[] = []
    const original = console.warn
    const g = globalThis as { window?: unknown }
    const hadWindow = 'window' in g
    g.window = g.window ?? {}
    console.warn = (...args: unknown[]) => warnings.push(args.join(' '))
    try {
      const i18n = loaded({ missingWarn: true })
      i18n.t('warn.me')
      i18n.tn(1, 'nope-format')
      i18n.td(0, 'nope-date')
      const quiet = loaded({ missingWarn: false })
      quiet.t('quiet')
      quiet.tn(1, 'quiet-format')
    } finally {
      console.warn = original
      if (!hadWindow) delete g.window
    }
    r.value('dev warnings (window defined)', warnings)
  }

  r.section('custom plural')
  {
    const custom: PluralFunc = (key, count, params, locale, getter) => (count === 99 ? null : `custom:${key}:${count}:${locale}:${show(params)}:${show(getter(key))}:${show(getter(key, { count }))}:${show(getter('missing'))}:${show(getter('missing', {}, ''))}:${show(getter('missing', {}, 'dv'))}`)
    const i18n = loaded({ plural: custom })
    for (const count of [1, 99, { count: 3, name: 'N' }]) r.run(`tc("apples", ${show(count)})`, () => i18n.tc('apples', count as never))
    const same = loaded({ plural: defaultPlural })
    r.value('plural: defaultPlural used as is', same.pluralFunc === defaultPlural)
    r.value('no plural option', loaded().pluralFunc === defaultPlural)
  }

  r.section('writes')
  {
    const en = enRoot()
    const enBefore = JSON.stringify(en)
    const i18n = new TestI18n('en', 'en', { missingWarn: false })
    i18n.loadTranslationsCore('en', en as Translations, false)
    r.run('t(nav.home) after set(false)', () => i18n.t('nav.home'))
    i18n.loadTranslationsCore('en', { nav: { home: 'Merged home', extra: 'X' } } as Translations, true)
    r.run('t(nav.home) after merge', () => i18n.t('nav.home'))
    r.run('t(nav.about) after merge keeps sibling', () => i18n.t('nav.about'))
    r.value('caller tree mutated by merge into a set() chunk', JSON.stringify(en) !== enBefore)

    const first = { nav: { a: 'A' } }
    const firstBefore = JSON.stringify(first)
    const i18n2 = new TestI18n('en', 'en', { missingWarn: false })
    i18n2.loadTranslationsCore('en', first as Translations, true)
    i18n2.loadTranslationsCore('en', { nav: { b: 'B' } } as Translations, true)
    r.value('caller tree mutated by second merge (first was merge)', JSON.stringify(first) !== firstBefore)
    r.run('t(nav.b)', () => i18n2.t('nav.b'))

    const page = { p: { a: 1 } }
    const pageBefore = JSON.stringify(page)
    i18n2.loadRouteTranslationsCore('en', 'about', page as Translations, false)
    i18n2.loadRouteTranslationsCore('en', 'about', { p: { b: 2 } } as Translations, false)
    i18n2.route = 'about'
    r.run('route chunk after loadRoute(false) twice', () => i18n2.resolveTranslations())
    r.value('caller page tree mutated', JSON.stringify(page) !== pageBefore)
    i18n2.loadRouteTranslationsCore('en', 'about', { p: { c: 3 } } as Translations, true)
    r.run('route chunk after loadRoute(true)', () => i18n2.resolveTranslations())

    const i18n3 = loaded()
    const changes = i18n3.changes
    for (const [key, value] of [
      ['greeting', 'Set {name}'],
      ['nav.home', { replaced: true }],
      ['brand.new', 'fresh'],
      ['flat.dotted', 'set flat'],
    ] as const) {
      i18n3.setTranslation(key, value)
      r.run(`setTranslation(${show(key)}) → t`, () => i18n3.t(key, { name: 'S' }))
    }
    r.run('t(nav.about) after replacing nav.home only', () => i18n3.t('nav.about'))
    r.value('onTranslationsChanged calls', i18n3.changes - changes)
    i18n3.locale = 'de'
    r.run('de unaffected by en setTranslation', () => i18n3.t('greeting', { name: 'S' }))
    i18n3.setTranslation('greeting', 'DE set')
    i18n3.route = 'about'
    r.run('about route does not see index setTranslation', () => i18n3.t('greeting'))
    i18n3.route = 'index'
    r.run('index sees it', () => i18n3.t('greeting'))

    i18n3.clearCache()
    r.run('after clearCache t(greeting)', () => i18n3.t('greeting'))
    r.run('after clearCache resolveTranslations', () => i18n3.resolveTranslations())
  }

  r.section('storage sharing and direct writes')
  {
    const storage: TranslationStorage = { translations: new Map() }
    const a = new TestI18n('en', 'en', { storage, missingWarn: false })
    const b = new TestI18n('en', 'en', { storage, missingWarn: false })
    a.loadTranslationsCore('en', { k: 'v1' } as Translations, false)
    r.run('b.t(k) after a writes', () => b.t('k'))
    b.loadTranslationsCore('en', { k: 'v2' } as Translations, false)
    r.run('a.t(k) after b writes', () => a.t('k'))
    storage.translations.set('en:index', { k: 'direct' } as Translations)
    r.run('a.t(k) after direct Map.set', () => a.t('k'))
    r.run('a.has(k) after direct Map.set', () => a.has('k'))
    ;(storage.translations.get('en:index') as Record<string, unknown>).k = 'mutated'
    r.run('a.t(k) after mutating the stored tree', () => a.t('k'))
    storage.translations.delete('en:index')
    r.run('a.t(k) after direct delete', () => a.t('k'))
    storage.translations.clear()
    r.run('a.t(k) after direct clear', () => a.t('k'))
  }

  r.section('clone-style storage copy (astro)')
  {
    const original = loaded()
    const copy: TranslationStorage = { translations: new Map() }
    for (const locale of ['en', 'de']) copy.translations.set(`${locale}:index`, { ...(original.helper.getCache(locale, 'index') as object) } as Translations)
    const clone = new TestI18n('en', 'en', { storage: copy, missingWarn: false })
    clone.helper.mergeTranslation('en', 'index', { nav: { home: 'Clone home' } } as Translations, true)
    clone.setTranslation('greeting', 'Clone greeting')
    r.run('clone.t(nav.home)', () => clone.t('nav.home'))
    r.run('original.t(nav.home) after clone merge', () => original.t('nav.home'))
    r.run('original.t(greeting) after clone set', () => original.t('greeting', { name: 'O' }))
  }

  r.section('useTranslationHelper')
  {
    const helper = useTranslationHelper()
    r.run('getTranslation on empty', () => helper.getTranslation('en', 'index', 'a'))
    r.run('getCache on empty', () => helper.getCache('en', 'index'))
    r.run('hasTranslation on empty', () => helper.hasTranslation('en', 'a'))
    helper.loadTranslations('en', { a: 'root' } as Translations)
    helper.loadPageTranslations('en', 'about', { b: 'page' } as Translations)
    helper.loadPageTranslations('en:x', 'y', { c: 'odd locale' } as Translations)
    helper.mergeTranslation('de', 'index', { a: 'de root' } as Translations)
    helper.setTranslations('fr', { a: 'fr' } as Translations)
    for (const [l, route, key] of [
      ['en', 'index', 'a'],
      ['en', 'about', 'a'],
      ['en', 'about', 'b'],
      ['de', 'index', 'a'],
      ['fr', 'index', 'a'],
      ['en:x', 'y', 'c'],
      ['en', 'x:y', 'c'],
    ] as const)
      r.run(`getTranslation(${l}, ${route}, ${key})`, () => helper.getTranslation(l, route, key))
    for (const [l, key] of [
      ['en', 'a'],
      ['en', 'b'],
      ['en', 'c'],
      ['de', 'b'],
      ['es', 'a'],
    ] as const)
      r.run(`hasTranslation(${l}, ${key})`, () => helper.hasTranslation(l, key))
    r.run('getCache(en, about)', () => helper.getCache('en', 'about'))
    helper.clearCache()
    r.run('after clearCache getCache(en, index)', () => helper.getCache('en', 'index'))
  }

  r.section('formatting through BaseI18n')
  {
    const i18n = new TestI18n('en-US', 'en-US', {
      missingWarn: false,
      numberFormats: { en: { currency: { style: 'currency', currency: 'USD' } }, de: { currency: { style: 'currency', currency: 'EUR' } }, 'en-US': { percent: { style: 'percent' } } },
      datetimeFormats: { en: { short: { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' } }, de: { short: { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' } } },
    })
    r.run('tn(1234.5)', () => i18n.tn(1234.5))
    r.run('tn(1234.5, {maximumFractionDigits:0})', () => i18n.tn(1234.5, { maximumFractionDigits: 0 }))
    r.run('tn(1234.5, "currency")', () => i18n.tn(1234.5, 'currency'))
    r.run('tn(0.25, "percent")', () => i18n.tn(0.25, 'percent'))
    r.run('tn(1234.5, "currency", "de")', () => i18n.tn(1234.5, 'currency', 'de'))
    r.run('tn(1234.5, "currency", "de-AT")', () => i18n.tn(1234.5, 'currency', 'de-AT'))
    r.run('tn(1234.5, "currency", {minimumFractionDigits:3})', () => i18n.tn(1234.5, 'currency', { minimumFractionDigits: 3 }))
    r.run('tn(1234.5, "nope")', () => i18n.tn(1234.5, 'nope'))
    r.run('tn(1234.5, "nope", {maximumFractionDigits:0})', () => i18n.tn(1234.5, 'nope', { maximumFractionDigits: 0 }))
    r.run('tn(NaN)', () => i18n.tn(Number.NaN))
    const date = Date.UTC(2024, 0, 15, 12, 30)
    r.run('td(date, {timeZone:"UTC"})', () => i18n.td(date, { timeZone: 'UTC' }))
    r.run('td(date, "short")', () => i18n.td(date, 'short'))
    r.run('td(date, "short", "de")', () => i18n.td(date, 'short', 'de'))
    r.run('td(date, "short", {month:"long"})', () => i18n.td(date, 'short', { month: 'long' }))
    r.run('td("2024-01-15T00:00:00Z", {timeZone:"UTC"})', () => i18n.td('2024-01-15T00:00:00Z', { timeZone: 'UTC' }))
    r.run('td("garbage")', () => i18n.td('garbage'))
    r.run('td(new Date(NaN))', () => i18n.td(new Date(Number.NaN)))
  }

  r.section('extend')
  {
    const i18n = loaded()
    const extended = i18n.extend({
      shout(this: TestI18n & { shout(): string }) {
        return String(this.t('farewell')).toUpperCase()
      },
    })
    r.value('extend returns same instance', extended === i18n)
    r.run('extended.shout()', () => extended.shout())
  }

  return r.toString()
}

export function formatReport(now: number): string {
  const r = new Recorder()
  const f = new FormatService({
    numberFormats: { en: { money: { style: 'currency', currency: 'USD' } }, 'pt-BR': { money: { style: 'currency', currency: 'BRL' } } },
    datetimeFormats: { en: { day: { weekday: 'long', timeZone: 'UTC' } } },
  })

  r.section('formatNumber')
  for (const locale of ['en-US', 'de-DE', 'fr', 'ar-EG', 'ja'])
    for (const options of [undefined, {}, { style: 'percent' }, { minimumFractionDigits: 2, maximumFractionDigits: 2 }, { maximumFractionDigits: 2, minimumFractionDigits: 2 }, { notation: 'compact' }] as Intl.NumberFormatOptions[])
      r.run(`formatNumber(1234567.891, ${locale}, ${show(options)})`, () => f.formatNumber(1234567.891, locale, options))
  r.run('formatNumber(1, "xx-invalid-??")', () => f.formatNumber(1, 'xx-invalid-??'))
  r.run('formatNumber(1, "en", {style:"currency"})', () => f.formatNumber(1, 'en', { style: 'currency' }))

  r.section('formatter cache')
  r.value('same options object → same formatter', f.getNumberFormatter('en', { style: 'percent' }) === f.getNumberFormatter('en', { style: 'percent' }))
  r.value('key order irrelevant', f.getNumberFormatter('en', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) === f.getNumberFormatter('en', { maximumFractionDigits: 2, minimumFractionDigits: 1 }))
  r.value('undefined vs {}', f.getNumberFormatter('en') === f.getNumberFormatter('en', {}))
  r.value('different locale', f.getNumberFormatter('en') === f.getNumberFormatter('de'))
  r.value('date undefined vs {}', f.getDateTimeFormatter('en') === f.getDateTimeFormatter('en', {}))
  r.value('relative cache', f.getRelativeTimeFormatter('en') === f.getRelativeTimeFormatter('en', {}))

  r.section('named formats')
  for (const [locale, key] of [
    ['en', 'money'],
    ['en-GB', 'money'],
    ['pt-BR', 'money'],
    ['pt', 'money'],
    ['en', 'nope'],
    ['zz', 'money'],
  ] as const) {
    r.run(`resolveNumberFormat(${locale}, ${key})`, () => f.resolveNumberFormat(locale, key))
    r.run(`resolveDateTimeFormat(${locale}, day)`, () => f.resolveDateTimeFormat(locale, 'day'))
  }
  r.run('getNumberFormats()', () => f.getNumberFormats())
  r.run('getDateTimeFormats()', () => f.getDateTimeFormats())
  f.setNumberFormats({ en: { plain: { useGrouping: false } } })
  r.run('after setNumberFormats resolve(en, plain)', () => f.resolveNumberFormat('en', 'plain'))
  r.run('after setNumberFormats resolve(en, money)', () => f.resolveNumberFormat('en', 'money'))
  f.setDateTimeFormats({})
  r.run('after setDateTimeFormats resolve(en, day)', () => f.resolveDateTimeFormat('en', 'day'))
  r.run('new FormatService() formats', () => [new FormatService().getNumberFormats(), new FormatService().getDateTimeFormats()])

  r.section('formatDate')
  for (const value of [Date.UTC(2024, 1, 29, 23, 59, 59), '2024-02-29', '2024-02-29T10:00:00Z', new Date(Date.UTC(2000, 0, 1)), 0, -1, '', 'not a date', Number.NaN, Infinity] as const)
    for (const locale of ['en-US', 'de-DE'])
      r.run(`formatDate(${show(value)}, ${locale}, UTC)`, () => f.formatDate(value as never, locale, { timeZone: 'UTC' }))
  r.run('formatDate(0, en, {dateStyle:"full", timeZone:"UTC"})', () => f.formatDate(0, 'en', { dateStyle: 'full', timeZone: 'UTC' }))

  r.section('formatRelativeTime (now fixed)')
  const offsets = [0, 0.4, 1, 30, 59, 60, 61, 3599, 3600, 7200, 86399, 86400, 86400 * 6, 86400 * 7, 86400 * 29, 86400 * 30, 86400 * 31, 86400 * 364, 86400 * 365, 86400 * 365 * 3]
  for (const seconds of offsets) {
    r.run(`past ${seconds}s (en)`, () => f.formatRelativeTime(now - seconds * 1000, 'en'))
    r.run(`future ${seconds}s (en)`, () => f.formatRelativeTime(now + seconds * 1000, 'en'))
  }
  for (const options of [{ numeric: 'auto' }, { style: 'short' }, { style: 'narrow', numeric: 'auto' }] as Intl.RelativeTimeFormatOptions[]) {
    r.run(`past 1 day ${show(options)}`, () => f.formatRelativeTime(now - 86400_000, 'en', options))
    r.run(`future 1 day ${show(options)}`, () => f.formatRelativeTime(now + 86400_000, 'en', options))
    r.run(`now ${show(options)}`, () => f.formatRelativeTime(now, 'en', options))
  }
  for (const locale of ['de', 'ru', 'ja']) r.run(`past 3 hours (${locale})`, () => f.formatRelativeTime(now - 3 * 3600_000, locale))
  r.run('relative(new Date(now - 2 days))', () => f.formatRelativeTime(new Date(now - 2 * 86400_000), 'en'))
  r.run('relative(ISO string 1 hour ago)', () => f.formatRelativeTime(new Date(now - 3600_000).toISOString(), 'en'))
  r.run('relative("garbage")', () => f.formatRelativeTime('garbage', 'en'))
  r.run('relative(NaN)', () => f.formatRelativeTime(Number.NaN, 'en'))

  f.clearCache()
  r.run('after clearCache formatNumber', () => f.formatNumber(1.5, 'en'))
  return r.toString()
}

export function devtoolsReport(): string {
  const r = new Recorder()
  const storage: TranslationStorage = { translations: new Map() }
  const set = (key: string, value: Record<string, unknown>) => storage.translations.set(key, value as Translations)
  set('en:index', enRoot())
  set('en:about', enAbout())
  set('de:index', deRoot())
  set('de:about', deAbout())
  set('fr:', { x: 'empty route' })
  set('ja:index', {})
  const active = mergeTranslationLayers(enRoot(), enAbout())
  const base = {
    storage,
    configuredLocales: [{ code: 'en', displayName: 'English' }, { code: 'de' }, { code: 'es', displayName: 'Español' }],
    activeLocale: 'en',
    activeRouteName: 'about',
    activeTranslations: active,
  }

  r.section('node ids')
  for (const id of ['', 'root', 'active', 'locale|en', 'locale|', 'chunk|en|about', 'chunk|en', 'chunk|', 'key|en|about|nav', 'key|en|about|a%2Eb|x', 'key|en', 'key|', 'unknown|x', 'key|de|index|nav/deep']) r.run(`parseInspectorNodeId(${show(id)})`, () => parseInspectorNodeId(id))
  for (const segments of [[], ['a'], ['a.b', 'c'], ['a/b', '%', '|', ' ']]) {
    const encoded = encodeInspectorPath(segments)
    r.value(`encode(${show(segments)})`, encoded)
    r.value(`decode(encode(${show(segments)}))`, decodeInspectorPath(encoded))
  }
  r.run('decodeInspectorPath("")', () => decodeInspectorPath(''))

  r.section('trees')
  for (const nodeId of ['root', 'active', 'locale|en', 'locale|de', 'locale|es', 'locale|fr', 'chunk|en|index', 'chunk|de|about', 'chunk|xx|index', 'key|en|index|nav', 'key|en|index|nav/deep', 'key|en|about|nav', 'key|en|index|flat', 'key|en|index|unicode', 'key|en|index|missing', 'key|en|index|greeting', 'bogus'])
    r.run(`buildInspectorTree(${nodeId})`, () => buildInspectorTree({ ...base, nodeId }))
  r.run('buildInspectorTree(root, activeRouteName "")', () => buildInspectorTree({ ...base, nodeId: 'root', activeRouteName: '' }))
  r.run('buildInspectorTree(active, no activeTranslations)', () => buildInspectorTree({ ...base, nodeId: 'active', activeTranslations: undefined }))
  r.run('flattenTranslationNode(en)', () => flattenTranslationNode(enRoot()))
  r.run('flattenTranslationNode(en, [nav, deep])', () => flattenTranslationNode(enRoot(), ['nav', 'deep']))
  r.run('flattenTranslationNode(en, [greeting])', () => flattenTranslationNode(enRoot(), ['greeting']))
  r.run('flattenTranslationNode(proto)', () => flattenTranslationNode(JSON.parse('{"__proto__":{"x":1},"b":{"c":1}}')))
  r.run('getByInspectorPath(en, [flat.dotted])', () => getByInspectorPath(enRoot(), ['flat.dotted']))
  r.run('getByInspectorPath(en, [flat, dotted])', () => getByInspectorPath(enRoot(), ['flat', 'dotted']))
  r.run('getByInspectorPath(en, [list, 0])', () => getByInspectorPath(enRoot(), ['list', '0']))
  r.run('getByInspectorPath(en, [])', () => getByInspectorPath(enRoot(), []))

  r.section('state and counts')
  r.run('buildInspectorState(full)', () =>
    buildInspectorState({ locale: 'en', routeName: 'about', strategy: 'prefix', defaultLocale: 'en', fallbackLocale: 'de', cachedChunks: 4, locales: [{ code: 'en', displayName: 'English' }, { code: 'de' }] }),
  )
  r.run('buildInspectorState(minimal)', () => buildInspectorState({ locale: 'en', routeName: 'index', cachedChunks: 0, locales: [] }))
  for (const [label, tree] of [
    ['en', enRoot()],
    ['de', deRoot()],
    ['{}', {}],
    ['undefined', undefined],
    ['string', 'x'],
    ['proto', JSON.parse('{"__proto__":{"x":1},"a":{"b":1}}')],
  ] as const)
    r.run(`countTranslationKeys(${label})`, () => countTranslationKeys(tree as never))

  return r.toString()
}

export function storeReport(): string {
  const r = new Recorder()
  const store = createReactiveI18nStore({ locale: 'en' })
  const events: string[] = []
  const off = store.subscribe(() => events.push(`a:${store.getSnapshot()}`))
  store.subscribe(() => events.push(`b:${store.getSnapshot()}`))
  r.value('initial', { snapshot: store.getSnapshot(), locale: store.getLocale(), fallback: store.getFallbackLocale(), route: store.getRoute() })
  store.setLocale('en')
  store.setLocale('de')
  store.setFallbackLocale('de')
  store.setFallbackLocale('en')
  store.setRoute('index')
  store.setRoute('about')
  store.notify()
  r.value('unsubscribe returns', off())
  store.setLocale('fr')
  r.value('events', events)
  r.value('final', { snapshot: store.getSnapshot(), locale: store.getLocale(), fallback: store.getFallbackLocale(), route: store.getRoute() })
  const full = createReactiveI18nStore({ locale: 'en', fallbackLocale: 'de', route: 'home' })
  r.value('with fallback and route', full.getSnapshot() + ' ' + full.getFallbackLocale())
  const selfRemoving = createReactiveI18nStore({ locale: 'en' })
  const order: string[] = []
  const offSelf = selfRemoving.subscribe(() => {
    order.push('self')
    offSelf()
  })
  selfRemoving.subscribe(() => order.push('other'))
  selfRemoving.notify()
  selfRemoving.notify()
  r.value('listener removing itself during notify', order)
  return r.toString()
}
