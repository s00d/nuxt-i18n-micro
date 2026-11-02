/** Root + delta: a page's text is the same whatever the layout, and no client sees a half of it. */
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { mergeTranslationChunk } from '@i18n-micro/core/helpers'
import { PREMERGED_ROOT_MARK } from '@i18n-micro/utils/merge-source'
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest'
import { pageFileOverRoot, preMergeLocales } from '../../src/build/build'
import { overRoot, takeRootMark } from '../../src/runtime/utils/translation-entry'
import { translationStorage } from '../../src/runtime/utils/storage'

type Tree = Record<string, unknown>

const page = (data: Tree, root: Tree) => pageFileOverRoot(data, root, 'm')
const restored = (data: Tree, root: Tree) => {
  const file = page(data, root)
  return takeRootMark(file) ? overRoot(root, file) : file
}

describe('a page file over its root', () => {
  test.for<[string, Tree, Tree]>([
    ['a key colliding in root and delta: the page wins', { a: 'root', b: 'root' }, { a: 'page', b: 'root' }],
    ['deep merge: siblings of a nested key stay', { n: { x: 1, y: 2 } }, { n: { x: 1, y: 3, z: 4 } }],
    ['a page replacing an object with a scalar', { n: { x: 1 } }, { n: 'flat' }],
    ['a scalar replaced with an object', { n: 'flat' }, { n: { x: 1 } }],
    ['arrays replace, never merge', { l: ['a', 'b', 'c'] }, { l: ['z'] }],
    ['an array over an object', { l: { a: 1 } }, { l: ['z'] }],
    ['plural forms stay one value', { p: 'one | two' }, { p: 'ein | zwei' }],
    ['null is a value', { a: 'root' }, { a: null }],
    ['flat dotted keys stay flat', { 'a.b': 'r' }, { 'a.b': 'p', 'a.c': 'n' }],
    ['an empty object', { a: 1 }, { a: 1, e: {} }],
    ['nothing of its own', { a: { b: 1 } }, { a: { b: 1 } }],
    ['a dropped root key: only a whole file gives it back', { n: { x: 1, y: 2 } }, { n: { y: 2 } }],
    ['a dropped top-level key', { a: 1, b: 2 }, { b: 2 }],
    ['a nested key in another order', { n: { x: 1, y: 2 } }, { n: { y: 2, x: 1 } }],
  ])('%s', ([, root, data]) => {
    expect(JSON.stringify(restored(data, root))).toBe(JSON.stringify(data))
  })

  test('holds only what differs, and says what it was made against', () => {
    expect(page({ a: 1, n: { x: 1, y: 2 } }, { a: 1, n: { x: 1, y: 3 } })).toEqual({ n: { y: 2 }, [PREMERGED_ROOT_MARK]: 'm' })
    expect(page({ a: 1 }, { a: 1 })).toEqual({ [PREMERGED_ROOT_MARK]: 'm' })
  })

  test('what cannot be a delta is a whole file, with no mark', () => {
    expect(page({ n: { y: 2 } }, { n: { x: 1, y: 2 } })).toEqual({ n: { y: 2 } })
  })

  test('a page with no key of its own is the root, one tree', () => {
    const root = { a: 1 }
    expect(overRoot(root, {})).toBe(root)
  })

  test('the merge copies only the paths it touches', () => {
    const root = { kept: { deep: 1 }, changed: { a: 1 } }
    const merged = mergeTranslationChunk(root, { changed: { a: 2 } })
    expect(merged.kept).toBe(root.kept)
    expect(root.changed).toEqual({ a: 1 })
  })
})

describe('a build', () => {
  const dir = mkdtempSync(join(tmpdir(), 'i18n-delta-'))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))
  const FILES: Record<string, Tree> = {
    'locales/en.json': { a: { b: 'en', c: 'en' }, list: ['en'], only: 'en', obj: { x: 'en' } },
    'locales/de.json': { a: { b: 'de' }, list: ['de', 'zwei'], obj: { y: 'de' } },
    'locales/fr.json': { only: 'fr' },
    'locales/pages/about/en.json': { title: 'About', a: { c: 'about' }, obj: 'flat in en', list: ['about'] },
    'locales/pages/about/de.json': { title: 'Über' },
    'locales/pages/shop/fr.json': { title: 'Boutique', a: { z: 'fr' } },
  }
  for (const [file, content] of Object.entries(FILES)) {
    mkdirSync(dirname(join(dir, 'app', file)), { recursive: true })
    writeFileSync(join(dir, 'app', file), JSON.stringify(content))
  }
  const LOCALES = [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }, { code: 'fr', fallbackLocale: 'de' }]
  const list = (root: string): string[] =>
    readdirSync(root).flatMap((name) => {
      const path = join(root, name)
      return statSync(path).isDirectory() ? list(path) : [path]
    })

  test.for([false, true])('every locale and page reads the same, disablePageLocales %s', async (disablePageLocales) => {
    const whole = join(dir, `whole-${disablePageLocales}`)
    const split = join(dir, `split-${disablePageLocales}`)
    const args: [string[], string] = [[join(dir, 'app')], 'locales']
    await preMergeLocales(...args, whole, LOCALES, undefined, disablePageLocales, [], ['contact'])
    await preMergeLocales(...args, split, LOCALES, undefined, disablePageLocales, [], ['contact'], true)
    for (const file of list(whole)) {
      const read = (root: string) => JSON.parse(readFileSync(file.replace(whole, root), 'utf8')) as Tree
      const data = read(split)
      const locale = file.split('/').at(-2)!
      const root = JSON.parse(readFileSync(join(split, '__root', locale, 'data.json'), 'utf8')) as Tree
      takeRootMark(root)
      const mark = takeRootMark(data)
      expect(mark ? overRoot(root, data) : data).toEqual(read(whole))
    }
    // the fallback chain's dropped key: en `about` turned `obj` into a string, and de's root makes it an object again
    if (!disablePageLocales) expect(list(split).length).toBe(list(whole).length)
  })
})

describe('a browser', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    translationStorage.clear()
  })
  const options = { apiBaseUrl: '_locales', baseURL: '/', rootDelta: true }
  const mark = PREMERGED_ROOT_MARK
  /** `$fetch` over a map of `page` to a file, or a function; each answer waits for its gate when one is set. */
  function host(files: Record<string, unknown>, gates: Record<string, Promise<void>> = {}) {
    const calls: { path: string; params?: Tree; cache?: string }[] = []
    vi.stubGlobal(
      '$fetch',
      vi.fn(async (path: string, init: { params?: Tree; cache?: string }) => {
        calls.push({ path, params: init.params, cache: init.cache })
        const name = path.split('/')[2]!
        await gates[name]
        const file = files[name]
        const body = typeof file === 'function' ? (file as (v: unknown) => unknown)(init.params?.v) : file
        if (body instanceof Error) throw body
        if (body === undefined) throw Object.assign(new Error('404'), { status: 404 })
        return structuredClone(body)
      }),
    )
    return calls
  }

  test('a delta that lands first waits for its root: no half a dictionary, ever', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => (release = resolve))
    host({ __root: { nav: 'root', [mark]: 'r' }, about: { title: 'page', [mark]: 'r' } }, { __root: gate })
    let done = false
    const load = translationStorage.load('de', 'about', options).then((result) => {
      done = true
      return result
    })
    await new Promise((resolve) => setTimeout(resolve, 5))
    expect(done).toBe(false)
    release()
    expect((await load).data).toEqual({ nav: 'root', title: 'page' })
  })

  test('the same the other way round', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => (release = resolve))
    host({ __root: { nav: 'root', [mark]: 'r' }, about: { title: 'page', [mark]: 'r' } }, { about: gate })
    const load = translationStorage.load('de', 'about', options)
    await new Promise((resolve) => setTimeout(resolve, 5))
    release()
    expect((await load).data).toEqual({ nav: 'root', title: 'page' })
  })

  test('a burst of pages costs one root', async () => {
    const calls = host({ __root: { nav: 'root', [mark]: 'r' }, a: { x: 1, [mark]: 'r' }, b: { y: 2, [mark]: 'r' } })
    await Promise.all([translationStorage.load('de', 'a', options), translationStorage.load('de', 'b', options)])
    expect(calls.filter((call) => call.path.includes('__root'))).toHaveLength(1)
  })

  test('no mark is a whole chunk: it stands alone, a key the root has and it dropped stays dropped', async () => {
    host({ __root: { nav: 'root', dropped: 1, [mark]: 'r' }, about: { nav: 'root', title: 'whole' } })
    expect((await translationStorage.load('de', 'about', options)).data).toEqual({ nav: 'root', title: 'whole' })
  })

  test('a host with no root file and whole chunks works, with the flag on', async () => {
    host({ about: { title: 'whole' } })
    expect((await translationStorage.load('de', 'about', options)).data).toEqual({ title: 'whole' })
  })

  test('a delta from a build that did not announce one still finds its root', async () => {
    const calls = host({ __root: { nav: 'root', [mark]: 'r' }, about: { title: 'page', [mark]: 'r' } })
    expect((await translationStorage.load('de', 'about', { ...options, rootDelta: false })).data).toEqual({ nav: 'root', title: 'page' })
    expect(calls).toHaveLength(2)
  })

  test('a failed root fails the load, and nothing stays: the next try works', async () => {
    const files: Record<string, unknown> = { __root: new Error('503'), about: { title: 'page', [mark]: 'r' } }
    host(files)
    await expect(translationStorage.load('de', 'about', options)).rejects.toThrow('503')
    expect(translationStorage.getFromCache('de', 'about')).toBeNull()
    files.__root = { nav: 'root', [mark]: 'r' }
    expect((await translationStorage.load('de', 'about', options)).data).toEqual({ nav: 'root', title: 'page' })
  })

  test('a failed delta fails the load, and the root it loaded stays', async () => {
    const files: Record<string, unknown> = { __root: { nav: 'root', [mark]: 'r' }, about: new Error('503') }
    const calls = host(files)
    await expect(translationStorage.load('de', 'about', options)).rejects.toThrow('503')
    files.about = { title: 'page', [mark]: 'r' }
    expect((await translationStorage.load('de', 'about', options)).data).toEqual({ nav: 'root', title: 'page' })
    expect(calls.filter((call) => call.path.includes('__root'))).toHaveLength(1)
  })

  test('a stale tab: a new delta on the root it holds asks for the new root, by a URL no cache has', async () => {
    const files: Record<string, unknown> = { __root: { nav: 'old', [mark]: 'r1' }, a: { x: 1, [mark]: 'r1' } }
    const calls = host(files)
    await translationStorage.load('de', 'a', options)
    // deploy: `moved` went from a page into the root
    files.__root = { nav: 'new', moved: 'in root', [mark]: 'r2' }
    files.b = { y: 2, [mark]: 'r2' }
    expect((await translationStorage.load('de', 'b', options)).data).toEqual({ nav: 'new', moved: 'in root', y: 2 })
    expect(calls.at(-1)).toMatchObject({ params: { v: 'r2' } })
  })

  test('a CDN mid-deploy with neither side new: one try, then the best text there is', async () => {
    const files = { __root: { nav: 'old', [mark]: 'r1' }, a: { x: 1, [mark]: 'r1' }, b: { y: 2, [mark]: 'r2' } }
    const calls = host(files)
    await translationStorage.load('de', 'a', options)
    expect((await translationStorage.load('de', 'b', options)).data).toEqual({ nav: 'old', y: 2 })
    expect(calls.filter((call) => call.path.includes('__root'))).toHaveLength(2)
  })

  test('a clear revalidates what comes next, root and delta', async () => {
    ;(globalThis as { __i18nSide?: string }).__i18nSide = 'client'
    const calls = host({ __root: { nav: 'root', [mark]: 'r' }, about: { title: 'page', [mark]: 'r' } })
    await translationStorage.load('de', 'about', options)
    translationStorage.clear()
    await translationStorage.load('de', 'about', options)
    expect(calls.slice(2).map((call) => call.cache)).toEqual(['no-cache', 'no-cache'])
    delete (globalThis as { __i18nSide?: string }).__i18nSide
  })

  test('the mark never reaches a dictionary', async () => {
    host({ __root: { nav: 'root', [mark]: 'r' }, about: { [mark]: 'r' } })
    const { data } = await translationStorage.load('de', 'about', options)
    expect(Object.keys(data)).toEqual(['nav'])
    expect(Object.keys((await translationStorage.load('de', '__root', options)).data)).toEqual(['nav'])
  })
})
