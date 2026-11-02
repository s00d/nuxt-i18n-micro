/**
 * Model of TranslationStorage, NuxtI18n and NuxtTranslationLoader: a fake host answers fetches in any
 * order while navigation, switches, edits, reloads and writes interleave. Fixed seed, so a failure repeats.
 * This is the model that found the fragment bug in `$loadPageTranslations`.
 */
import fc from 'fast-check'
import { expect, test, vi } from 'vitest'
import { STORAGE_CC_KEY } from '../../src/runtime/utils/cache-keys'
import { NuxtI18n, NuxtTranslationLoader } from '../../src/runtime/utils/nuxt-i18n'
import { translationStorage } from '../../src/runtime/utils/storage'
import { expectOnlyCalls } from '../helpers/expect-only-calls'

const SEED = 42
const RUNS = 300
const LOCALES = ['en', 'de']
const ROUTES = ['index', 'about']
const ROOT = '__root'

interface Pending {
  key: string
  version: number
  missing: boolean
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
}

function fakeHost() {
  const version = new Map<string, number>()
  const missing = new Set<string>()
  const inflight: Pending[] = []
  const fileOf = (key: string, ver: number) => {
    const [locale, route] = key.split('/')
    return { who: `${locale}/${route}`, ver, over: 'file', [`only_${locale}`]: 1, nested: { loc: locale, ver } }
  }
  // /_locales/<route>/<locale>/data.json: the answer is what the file was when asked
  const fetch = (path: string) =>
    new Promise((resolve, reject) => {
      const [, , route, locale] = path.split('/')
      const key = `${locale}/${route}`
      inflight.push({ key, version: version.get(key) ?? 1, missing: missing.has(key), resolve, reject })
    })
  const answer = (index: number, how: 'ok' | 'fail') => {
    const pending = inflight.splice(index % inflight.length, 1)[0]!
    if (how === 'fail') pending.reject(Object.assign(new Error('503'), { status: 503 }))
    else if (pending.missing) pending.reject(Object.assign(new Error('404'), { status: 404 }))
    else pending.resolve(fileOf(pending.key, pending.version))
  }
  return { version, missing, inflight, fetch, answer }
}

test('a prerender with no file and no root fails: raw keys must not reach a written file', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.stubGlobal(
    '$fetch',
    vi.fn(async () => {
      throw Object.assign(new Error('404'), { status: 404 })
    }),
  )
  const options = (prerender: boolean) => ({
    i18n: new NuxtI18n({ plural: (key: string) => key }),
    loadOptions: { apiBaseUrl: '_locales', baseURL: '/' },
    isDev: false,
    prerender,
  })
  const build = globalThis as { __i18nSide?: string; __i18nPrerender?: boolean }
  build.__i18nSide = 'server'
  build.__i18nPrerender = true
  await expect(new NuxtTranslationLoader(options(true)).switchContext('en', 'about')).rejects.toThrow('Translation load failed: en about')
  delete build.__i18nSide
  delete build.__i18nPrerender
  expect(console.warn).toHaveBeenCalledWith('[i18n] Translation load failed:', 'en', 'about')
  // a request shows what it can, and the next one reads again
  await expect(new NuxtTranslationLoader(options(false)).switchContext('en', 'about')).resolves.toBe(true)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('setTranslation over a stand-in is no loaded chunk: the next visit still loads the file', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  let down = true
  vi.stubGlobal(
    '$fetch',
    vi.fn(async (path: string) => {
      if (path.includes('__root')) return { nav: 'Root' }
      if (down) throw Object.assign(new Error('503'), { status: 503 })
      return path.includes('about') ? { nav: 'Root', other: 'Other' } : {}
    }),
  )
  const i18n = new NuxtI18n({ plural: (key: string) => key })
  const loader = new NuxtTranslationLoader({ i18n, loadOptions: { apiBaseUrl: '_locales', baseURL: '/' }, isDev: false })
  await loader.switchContext('en', 'about')
  i18n.setTranslation('title', 'Mine')
  expect(i18n.hasChunk('en', 'about')).toBe(false)
  down = false
  await loader.switchContext('de', 'index')
  await loader.switchContext('en', 'about')
  expect([i18n.t('other'), i18n.t('title')]).toEqual(['Other', 'Mine'])
  expect(warn).toHaveBeenCalledExactlyOnceWith('[i18n] Translation load failed:', 'en', 'about')
  translationStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve()
  await new Promise((done) => setTimeout(done, 0))
}

const locale = fc.constantFrom(...LOCALES)
const route = fc.constantFrom(...ROUTES)
const place = { l: locale, r: route }
const step = fc.oneof(
  { weight: 3, arbitrary: fc.record({ k: fc.constant('switch' as const), ...place }) },
  { weight: 3, arbitrary: fc.record({ k: fc.constant('nav' as const), ...place, commit: fc.boolean() }) },
  {
    weight: 6,
    arbitrary: fc.record({ k: fc.constant('answer' as const), i: fc.nat(5), how: fc.constantFrom('ok' as const, 'ok' as const, 'fail' as const) }),
  },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('edit' as const), ...place }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('gone' as const), ...place }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('hmr' as const) }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('reload' as const) }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('patch' as const), v: fc.constantFrom('p1', 'p2') }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('set' as const), v: fc.constantFrom('s1', 's2') }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('finish' as const) }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('cfg' as const), n: fc.constantFrom(0, 1, 2) }) },
)
type Step = typeof step extends fc.Arbitrary<infer T> ? T : never

async function exec(steps: Step[]) {
  translationStorage.clear()
  translationStorage.configure({})
  const host = fakeHost()
  vi.stubGlobal('$fetch', host.fetch)
  const i18n = new NuxtI18n({ missingWarn: false })
  const loader = new NuxtTranslationLoader({ i18n, loadOptions: { apiBaseUrl: '_locales', baseURL: '/' } })
  const pendingNavs: Promise<unknown>[] = []
  let navSeq = 0
  // what a page wrote, per context; a reload drops it
  const written = new Map<string, { patched?: string; setKey?: string }>()
  const contextKey = () => `${i18n.getLocale()}/${i18n.getCurrentRouteName()}`
  const cleared = new Map<string, number>()
  let lastSwitch: { l: string; r: string } | null = null
  let troubled = false

  const settled = async () => {
    for (let i = 0; i < 60; i++) {
      await tick()
      if (!host.inflight.length) break
      while (host.inflight.length) host.answer(0, 'ok')
    }
    await Promise.all(pendingNavs)
    await tick()
  }
  const check = (at: string) => {
    const shown = { l: i18n.getLocale(), r: i18n.getCurrentRouteName() }
    const who = String(i18n.t('who'))
    if (who !== `${shown.l}/${shown.r}` && who !== `${shown.l}/${ROOT}`) throw new Error(`${at}: context ${shown.l}/${shown.r} shows ${who}`)
    if (i18n.t('nested.loc') !== shown.l) throw new Error(`${at}: nested from ${String(i18n.t('nested.loc'))} in ${shown.l}`)
    // nothing of another locale answers, the leaving page's layer included
    for (const other of LOCALES) if (other !== shown.l && i18n.has(`only_${other}`)) throw new Error(`${at}: ${shown.l} answers only_${other}`)
    // the process-wide cache holds nothing older than the last clear
    for (const l of LOCALES)
      for (const r of [...ROUTES, ROOT]) {
        const hit = translationStorage.getFromCache(l, r)
        const floor = cleared.get(`${l}/${r}`) ?? 0
        if (hit && (hit.ver as number) < floor) throw new Error(`${at}: cache holds ${l}/${r} v${String(hit.ver)}, cleared at v${floor}`)
      }
  }
  const markClear = () => {
    for (const [key, version] of host.version) cleared.set(key, version)
  }

  const first = loader.switchContext('en', 'index')
  await tick()
  host.answer(0, 'ok')
  await first

  for (const item of steps) {
    switch (item.k) {
      case 'switch':
        lastSwitch = item
        troubled = false
        pendingNavs.push(loader.switchContext(item.l, item.r))
        break
      case 'nav': {
        // the plugin's guard, then afterEach; the router commits only the newest navigation
        const seq = ++navSeq
        lastSwitch = null
        loader.invalidatePendingSwitches()
        const changed = item.l !== i18n.getLocale() || item.r !== i18n.getCurrentRouteName()
        const data = changed ? loader.fetchContext(item.l, item.r) : null
        pendingNavs.push(
          Promise.resolve(data).then((loaded) => {
            if (!item.commit || seq !== navSeq || !changed) return
            lastSwitch = null
            const before = contextKey()
            const applied = loader.applyContext(item.l, item.r, loaded && (loader.loadFromCacheSync(item.l, item.r) ?? loaded))
            if (applied && before !== `${item.l}/${item.r}`) i18n.finishTransition()
          }),
        )
        break
      }
      case 'answer':
        if (host.inflight.length) {
          if (item.how === 'fail') troubled = true
          host.answer(item.i, item.how)
        }
        break
      case 'edit':
        host.version.set(`${item.l}/${item.r}`, (host.version.get(`${item.l}/${item.r}`) ?? 1) + 1)
        break
      case 'gone':
        if (!host.missing.delete(`${item.l}/${item.r}`)) host.missing.add(`${item.l}/${item.r}`)
        troubled = true
        break
      case 'hmr':
        ;(globalThis as unknown as Record<symbol, { clear(): void }>)[STORAGE_CC_KEY]!.clear()
        markClear()
        break
      case 'reload':
        written.clear()
        markClear()
        pendingNavs.push(loader.reload())
        break
      case 'patch':
        i18n.mergeTranslations({ over: item.v } as never)
        written.set(contextKey(), { ...written.get(contextKey()), patched: item.v })
        break
      case 'set':
        i18n.setTranslation('setk', item.v)
        written.set(contextKey(), { ...written.get(contextKey()), setKey: item.v })
        break
      case 'finish':
        i18n.finishTransition()
        break
      case 'cfg':
        translationStorage.configure({ maxSize: item.n })
        break
    }
    await tick()
    check(`step ${JSON.stringify(item)}`)
  }

  await settled()
  check('settled')
  if (lastSwitch && !troubled) expect(contextKey()).toBe(`${lastSwitch.l}/${lastSwitch.r}`)
  host.missing.clear()

  // a string the page wrote is back when the page is (no reload since)
  for (const [key, wanted] of written) {
    const [l, r] = key.split('/') as [string, string]
    const back = loader.switchContext(l, r)
    await settled()
    await back
    if (wanted.patched !== undefined) expect(i18n.t('over')).toBe(wanted.patched)
    if (wanted.setKey !== undefined) expect(i18n.t('setk')).toBe(wanted.setKey)
  }

  // a reload after the last edit shows the last edit, on this page and on any later one
  const current = { l: i18n.getLocale(), r: i18n.getCurrentRouteName() }
  i18n.finishTransition()
  const reload = loader.reload()
  await settled()
  await reload
  expect(i18n.t('ver')).toBe(host.version.get(`${current.l}/${current.r}`) ?? 1)
  expect(i18n.t('over')).toBe('file')
  expect(i18n.t('setk')).toBe('setk')
  for (const l of LOCALES)
    for (const r of ROUTES) {
      const visit = loader.switchContext(l, r)
      await settled()
      await visit
      expect(i18n.t('who')).toBe(`${l}/${r}`)
      expect(i18n.t('ver')).toBe(host.version.get(`${l}/${r}`) ?? 1)
    }
}

test('the shown translations stay right under any order of answers', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  await fc.assert(
    fc.asyncProperty(fc.array(step, { maxLength: 24 }), (steps) => exec(steps)),
    { numRuns: RUNS, seed: SEED },
  )
  expectOnlyCalls(warn, [/Translation load failed/])
  // a hosted Windows runner needs more than a minute for the same runs
}, 180_000)
