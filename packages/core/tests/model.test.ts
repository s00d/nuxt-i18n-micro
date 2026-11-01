/**
 * Model of the stored trees, leaf caches, layers and set-at-key: random dictionaries and random
 * sequences against a reference made of plain JSON and naive walks. Fixed seed, so a failure repeats.
 */
import { isDeepStrictEqual } from 'node:util'
import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import {
  BaseI18n,
  type BaseI18nOptions,
  mergeTranslationChunk,
  mergeTranslationLayers,
  setTranslationAtKey,
  TranslationHelper,
  translationCacheKey,
} from '../src'
import type { Tree } from '../src/tree'

const SEED = 42
const RUNS = 3000
const check = <T extends unknown[]>(property: fc.IProperty<T>, numRuns = RUNS) => fc.assert(property, { numRuns, seed: SEED })

const NESTED_KEYS = ['a', 'b', 'c', 'list', '0', '1', 'constructor', 'toString', '__proto__', 'length']
const ALL_KEYS = [...NESTED_KEYS, 'a.b', 'b.c']
const QUERIES = [
  'a',
  'b',
  'c',
  'a.b',
  'a.b.c',
  'b.c',
  'a.a',
  'a.a.b',
  'list',
  'list.0',
  'list.1',
  'list.0.a',
  'list.length',
  'a.length',
  '0',
  '1.a',
  'constructor',
  'toString',
  'a.constructor',
  'a.b.a.b',
  'length',
]

const leaf = fc.oneof(fc.constantFrom('s', 'q', ''), fc.integer({ min: 0, max: 3 }), fc.constant(null))

function treeOf(keys: string[]): fc.Arbitrary<Tree> {
  const { tree } = fc.letrec<{ value: unknown; tree: Tree }>((tie) => ({
    value: fc.oneof({ maxDepth: 3 }, leaf, tie('tree'), fc.array(fc.oneof(leaf, tie('tree')), { maxLength: 2 })),
    tree: fc
      .array(fc.tuple(fc.constantFrom(...keys), tie('value')), { maxLength: 4 })
      // through JSON: `__proto__` an own key, as a dictionary file has it
      .map(
        (pairs) => JSON.parse(`{${[...new Map(pairs)].map(([key, value]) => `${JSON.stringify(key)}:${JSON.stringify(value)}`).join(',')}}`) as Tree,
      ),
  }))
  return tree
}

const tree = treeOf(ALL_KEYS)
/** A dotted flat key reads first, by design (`docs`: flat-first), so "the leaf stays" and "upper wins" hold only without one. */
const nestedTree = treeOf(NESTED_KEYS)

const own = (node: object, key: string) => Object.hasOwn(node, key)
const isTree = (value: unknown): value is Tree => value !== null && typeof value === 'object' && !Array.isArray(value)
const isScalar = (value: unknown) => value === null || typeof value !== 'object'

/** The read rule of tree.ts in words: own flat key unless null, then an own-key walk; arrays by index, not `length`; never through `__proto__`. */
function read(node: Tree, key: string): unknown {
  if (own(node, key) && node[key] !== null) return node[key]
  if (!key.includes('.')) return own(node, key) ? node[key] : null
  let current: unknown = node
  for (const part of key.split('.')) {
    if (
      current === null ||
      typeof current !== 'object' ||
      part === '__proto__' ||
      !own(current, part) ||
      (Array.isArray(current) && part === 'length')
    )
      return null
    current = (current as Tree)[part]
  }
  return current === undefined ? null : current
}

function withoutProto(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutProto)
  if (!isTree(value)) return value
  return Object.fromEntries(
    Object.keys(value)
      .filter((key) => key !== '__proto__')
      .map((key) => [key, withoutProto(value[key])]),
  )
}

/** The merge, on a copy of the world. */
function merged(base: Tree, patch: Tree): Tree {
  const out = withoutProto(base) as Tree
  for (const key of Object.keys(patch)) {
    if (key !== '__proto__')
      out[key] = own(out, key) && isTree(out[key]) && isTree(patch[key]) ? merged(out[key] as Tree, patch[key] as Tree) : withoutProto(patch[key])
  }
  return out
}

describe('core model', () => {
  test('a merge is the plain JSON merge, and leaves its inputs alone', () => {
    check(
      fc.property(tree, tree, (base, patch) => {
        const before = JSON.stringify([base, patch])
        const result = mergeTranslationChunk(base, patch)
        expect(JSON.stringify([base, patch])).toBe(before)
        if (Object.keys(base).length) expect(withoutProto(result)).toEqual(merged(base, patch))
      }),
    )
  })

  test('preserveExisting: a leaf the chunk has stays', () => {
    check(
      fc.property(nestedTree, nestedTree, (base, patch) => {
        fc.pre(!JSON.stringify(base).includes('__proto__'))
        const result = mergeTranslationChunk(base, patch, { preserveExisting: true })
        for (const key of QUERIES) {
          const kept = read(base, key)
          if (isScalar(kept) && kept !== null) expect(read(result, key)).toEqual(kept)
        }
      }),
    )
  })

  test('getTranslation follows the read rule', () => {
    check(
      fc.property(tree, (dictionary) => {
        const helper = new TranslationHelper()
        helper.setTranslations('en', dictionary, 'page')
        for (const key of QUERIES) expect(helper.getTranslation('en', 'page', key)).toEqual(read(dictionary, key))
      }),
    )
  })

  test('layers answer what upper, then lower, answers', () => {
    check(
      fc.property(nestedTree, nestedTree, (lower, upper) => {
        const result = mergeTranslationLayers(lower, upper)
        for (const key of QUERIES) {
          const wanted = read(upper, key) ?? read(lower, key)
          if (isScalar(wanted)) expect(read(result, key)).toEqual(wanted)
        }
      }),
    )
  })

  test('set-at-key reads back and leaves its input alone', () => {
    check(
      fc.property(tree, fc.constantFrom(...QUERIES), fc.constantFrom('NEW', 7), (dictionary, key, value) => {
        const before = JSON.stringify(dictionary)
        const result = setTranslationAtKey(dictionary, key, value)
        expect(JSON.stringify(dictionary)).toBe(before)
        expect(read(result, key)).toBe(value)
      }),
    )
  })

  test('two helpers over one storage, direct writes included, answer like the reference after every step', () => {
    const context = fc.constantFrom('en:x', 'en:y', 'de:x')
    const direct = fc.constantFrom('en:x', 'de:x')
    const step = fc.oneof(
      fc.record({ kind: fc.constant('set' as const), context, tree }),
      fc.record({ kind: fc.constant('merge' as const), context, tree }),
      fc.record({ kind: fc.constant('direct' as const), context: direct, tree }),
      fc.record({ kind: fc.constant('drop' as const), context: direct }),
      fc.record({ kind: fc.constant('clear' as const) }),
      fc.record({ kind: fc.constant('read' as const), who: fc.nat(1), context, query: fc.constantFrom(...QUERIES) }),
    )
    check(
      fc.property(fc.array(step, { maxLength: 25 }), (steps) => {
        const storage = { translations: new Map<string, Tree>() }
        const helpers = [new TranslationHelper(storage), new TranslationHelper(storage)] as const
        const model = new Map<string, Tree>()
        const given: [Tree, string][] = []
        for (const item of steps) {
          if (item.kind === 'clear') {
            helpers[0].clearCache()
            model.clear()
            continue
          }
          const [locale, route] = item.context.split(':') as [string, string]
          const key = translationCacheKey(locale, route)
          if (item.kind === 'set') {
            helpers[0].setTranslations(locale, item.tree, route)
            model.set(key, item.tree)
            given.push([item.tree, JSON.stringify(item.tree)])
          } else if (item.kind === 'merge') {
            helpers[1].mergeTranslation(locale, route, item.tree)
            model.set(key, merged(model.get(key) ?? {}, item.tree))
            given.push([item.tree, JSON.stringify(item.tree)])
          } else if (item.kind === 'direct') {
            storage.translations.set(key, item.tree)
            model.set(key, item.tree)
          } else if (item.kind === 'drop') {
            storage.translations.delete(key)
            model.delete(key)
          } else {
            const wanted = model.has(key) ? read(model.get(key)!, item.query) : null
            expect(JSON.stringify(helpers[item.who].lookup(key, item.query))).toBe(JSON.stringify(wanted))
          }
          for (const [handed, text] of given) expect(JSON.stringify(handed)).toBe(text)
        }
      }),
      1000,
    )
  })

  class Host extends BaseI18n {
    constructor(
      options: BaseI18nOptions,
      private readonly locale: string,
      private readonly fallback: string,
      private readonly route: string,
    ) {
      super(options)
    }
    getLocale() {
      return this.locale
    }
    override getFallbackLocale() {
      return this.fallback
    }
    getRoute() {
      return this.route
    }
  }

  test('the resolved dump answers what t() answers, fallback layers included', () => {
    check(
      fc.property(nestedTree, nestedTree, nestedTree, nestedTree, fc.constantFrom('page', 'index'), (rootEn, pageEn, rootDe, pageDe, route) => {
        const i18n = new Host({ missingWarn: false }, 'en', 'de', route)
        i18n.loadTranslationsCore('en', rootEn, false)
        i18n.loadTranslationsCore('de', rootDe, false)
        if (route !== 'index') {
          i18n.loadTranslationsCore('en', pageEn, false, route)
          i18n.loadTranslationsCore('de', pageDe, false, route)
        }
        const dump = i18n.resolveTranslations()
        for (const key of QUERIES) {
          const wanted = i18n.t(key, undefined, '∅')
          if (isScalar(wanted) && wanted !== '∅' && !isDeepStrictEqual(read(dump, key), wanted))
            throw new Error(`${key}: t() ${JSON.stringify(wanted)}, dump ${JSON.stringify(dump)}`)
        }
      }),
      1000,
    )
  })
})
