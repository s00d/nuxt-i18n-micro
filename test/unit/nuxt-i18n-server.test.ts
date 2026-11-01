/**
 * A server request's patches stay beside the shared chunk and a lookup reads through them. Nothing is merged, so what pins
 * this class is that it answers exactly what a merged tree answers, for every key and every shape a merge treats apart.
 */
import { expect, test } from 'vitest'
import { NuxtI18n } from '../../src/runtime/utils/nuxt-i18n'
import { ServerNuxtI18n } from '../../src/runtime/utils/nuxt-i18n-server'

type Tree = Record<string, unknown>

const CHUNKS: Tree[] = [
  {},
  { a: 'text', b: { c: 'deep', d: { e: 'deeper' } }, list: ['one', 'two'], nothing: null },
  { 'a.b': 'flat', a: { b: 'nested', c: 'other' }, 'x.y': null, x: { y: 'below a null flat key' } },
  { constructor: 'own', toString: 'own', a: { length: 'own length' }, list: [{ deep: 'in a list' }] },
  JSON.parse('{"a":{"__proto__":{"x":"own"},"z":"z"}}'),
]

const FRAGMENTS: Tree[][] = [
  [{}],
  [{ fresh: 'fresh' }],
  [{ a: 'replaced' }],
  [{ a: { added: 'added' } }],
  [{ a: null }],
  [{ b: null }],
  [{ b: { c: { now: 'a tree' } } }],
  [{ b: { d: 'a leaf now' } }],
  [{ list: ['new'] }],
  [{ list: { 0: 'a tree over an array' } }],
  [{ 'a.b': 'flat patch' }],
  [{ a: { b: 'nested patch' } }],
  [{ x: { y: 'patched' } }],
  [{ 'x.y': 'flat over null' }],
  [{ a: 's' }, { a: { x: 'a tree on a text' } }],
  [{ a: { x: 'tree' } }, { a: 's' }],
  [{ a: { x: 'one' } }, { a: { y: 'two' } }],
  [{ a: { b: 'one' } }, { a: { b: 'two' } }, { a: { b: { c: 'three' } } }],
  [{ b: { d: { e: 'one' } } }, { b: null }, { b: { d: { f: 'again' } } }],
  [JSON.parse('{"__proto__":{"x":"proto"},"safe":"safe"}')],
  [{ toString: { deep: 'a tree over an own key' } }],
]

const KEYS = [
  ...['a', 'a.b', 'a.c', 'a.added', 'a.x', 'a.y', 'a.b.c', 'a.length', 'b', 'b.c', 'b.c.now', 'b.d', 'b.d.e', 'b.d.f', 'fresh', 'safe', 'x', 'x.y'],
  ...['list', 'list.0', 'list.1', 'list.length', 'list.0.deep', 'nothing', 'missing', 'missing.deep', 'a.b.c.d'],
  ...['constructor', 'toString', 'toString.deep', '__proto__', '__proto__.x', 'a.__proto__', 'a.__proto__.x', 'a.z', '', '.', 'a.', '.a'],
]

function instances(chunk: Tree, fragments: Tree[]) {
  const server = new ServerNuxtI18n({ missingWarn: false })
  const merged = new NuxtI18n({ missingWarn: false })
  for (const i18n of [server, merged]) {
    i18n.applySwitchContext('en', 'page', chunk)
    for (const fragment of fragments) i18n.mergeTranslations(fragment as never)
  }
  return { server, merged }
}

const read = (i18n: NuxtI18n, key: string) => [key, i18n.has(key), i18n.t(key, undefined, 'MISSING')]

test('every key reads as in a merged tree, before and after the merge is made', () => {
  for (const chunk of CHUNKS)
    for (const fragments of FRAGMENTS) {
      const { server, merged } = instances(chunk, fragments)
      for (const key of KEYS) expect(read(server, key)).toEqual(read(merged, key))
      expect(server.resolveTranslations()).toEqual(merged.resolveTranslations())
      for (const key of KEYS) expect(read(server, key)).toEqual(read(merged, key))
    }
})

test('the chunk stays the one tree, unread and unwritten', () => {
  const chunk = Object.freeze({ a: Object.freeze({ b: 'b' }) })
  const i18n = new ServerNuxtI18n({ missingWarn: false })
  i18n.applySwitchContext('en', 'page', chunk)
  i18n.mergeTranslations({ a: { c: 'c' } })
  expect(i18n.storage.translations.get('en:page')).toBe(chunk)
  expect(i18n.t('a')).toEqual({ b: 'b', c: 'c' })
  expect(i18n.t('a.b')).toBe('b')
})

test('a patch of another chunk waits there, and arrives with it', () => {
  const i18n = new ServerNuxtI18n({ missingWarn: false })
  i18n.applySwitchContext('en', 'page', { key: 'en' })
  i18n.setChunk('de', 'page', { key: 'de', kept: 'kept' })
  void i18n.loadPageTranslations('de', 'page', { added: 'added' })
  expect(i18n.has('added')).toBe(false)
  i18n.applySwitchContext('de', 'page', i18n.getChunk('de', 'page'))
  expect(['key', 'kept', 'added'].map((key) => i18n.t(key))).toEqual(['de', 'kept', 'added'])
})

test('a route reads its chunk through its patches', () => {
  const i18n = new ServerNuxtI18n({ missingWarn: false })
  i18n.setRouteContextResolver((route) => ({ locale: 'de', routeName: route as string }))
  i18n.applySwitchContext('en', 'page', { key: 'en' })
  i18n.setChunk('de', 'other', { key: 'de' })
  void i18n.loadPageTranslations('de', 'other', { added: 'added' })
  expect(i18n.t('added', undefined, undefined, 'other')).toBe('added')
  expect(i18n.t('key', undefined, undefined, 'other')).toBe('de')
  expect(i18n.t('added')).toBe('added')
})

test('a write and a drop see the patches: nothing registered is lost', () => {
  const i18n = new ServerNuxtI18n({ missingWarn: false })
  i18n.applySwitchContext('en', 'page', { key: 'en' })
  i18n.mergeTranslations({ added: 'added' })
  i18n.setTranslation('set', 'set')
  expect(i18n.getChunk('en', 'page')).toEqual({ key: 'en', added: 'added', set: 'set' })

  const overwritten = new ServerNuxtI18n({ missingWarn: false })
  overwritten.applySwitchContext('en', 'page', { key: 'en' })
  overwritten.mergeTranslations({ late: 'late' })
  overwritten.setTranslation('late', 'set after the patch')
  expect(overwritten.t('late')).toBe('set after the patch')

  const dropped = new ServerNuxtI18n({ missingWarn: false })
  dropped.applySwitchContext('en', 'page', { key: 'en' })
  dropped.mergeTranslations({ dropped: 'dropped' })
  dropped.dropChunks()
  expect(dropped.resolveTranslations()).toEqual({ key: 'en', dropped: 'dropped' })
  expect(dropped.hasChunk('en', 'page')).toBe(false)

  dropped.mergeTranslations({ again: 'again' })
  dropped.clearCache()
  expect(dropped.has('again')).toBe(false)
})

test('the leaving page keeps its patches until it is gone', () => {
  const i18n = new ServerNuxtI18n({ missingWarn: false })
  i18n.applySwitchContext('en', 'a', { key: 'a' })
  i18n.mergeTranslations({ added: 'added', key: 'patched' })
  i18n.applySwitchContext('en', 'b', { key: 'b' })
  expect(i18n.t('added')).toBe('added')
  expect(i18n.t('key')).toBe('b')
})

test('a stand-in is no chunk: the patch merges into what is on screen', () => {
  const i18n = new ServerNuxtI18n({ missingWarn: false })
  i18n.setChunk('en', 'page', { stored: 'stored' })
  i18n.applySwitchContext('en', 'page', { standIn: 'stand-in' }, true)
  i18n.mergeTranslations({ added: 'added' })
  expect(['standIn', 'added'].map((key) => i18n.t(key))).toEqual(['stand-in', 'added'])
  expect(i18n.getChunk('en', 'page')).toEqual({ stored: 'stored', added: 'added' })
})

test('a fragment under its own overlay is still no loaded chunk, and the file arrives under both', () => {
  const i18n = new ServerNuxtI18n({ missingWarn: false })
  i18n.applySwitchContext('en', 'page', { key: 'en' })
  void i18n.loadPageTranslations('de', 'page', { first: 'first' })
  void i18n.loadPageTranslations('de', 'page', { second: 'second', file: 'patched' })
  expect(i18n.hasChunk('de', 'page')).toBe(false)
  i18n.installChunk('de', 'page', { file: 'file', own: 'own' })
  expect(i18n.getChunk('de', 'page')).toEqual({ first: 'first', second: 'second', file: 'patched', own: 'own' })
  expect(i18n.hasChunk('de', 'page')).toBe(true)
})

test('a caller keeps its object', () => {
  const fragment = { a: { b: 'b' } }
  const i18n = new ServerNuxtI18n({ missingWarn: false })
  i18n.applySwitchContext('en', 'page', { key: 'en' })
  i18n.mergeTranslations(fragment)
  fragment.a.b = 'changed'
  expect(i18n.t('a.b')).toBe('b')
})
