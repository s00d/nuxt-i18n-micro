/**
 * What no golden sees: shared chunks stay as they were, tree identity survives requests, and the cost of a request does
 * not follow the size of the dictionary. Each budget is a ratio to a request of the same app with the feature off, as a
 * ratio survives a slow machine.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import plugin from '../../src/runtime/plugins/01.plugin'
import { translationStorage } from '../../src/runtime/utils/storage'
import { createApp, hydrate, runPlugin } from './plugin-harness'

vi.mock('#imports', async () => (await import('./plugin-harness')).stub)

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  translationStorage.clear()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    Object.values(value).forEach(deepFreeze)
  }
  return value
}

const bigChunk = (keys = 100_000) => Object.fromEntries(Array.from({ length: keys }, (_, index) => [`key_${index}`, `value ${index}`]))

type Subscriber = (register: (translations: unknown, locale?: string) => void, locale: string) => void

/** One server request: a new app on the process-wide storage. */
async function request(options: { chunk: Record<string, unknown>; preload?: boolean; subscriber?: Subscriber; url?: string }) {
  const { chunk, preload, subscriber, url = '/en/about' } = options
  const a = await createApp({ side: 'server', strategy: 'prefix', url, detected: 'en', chunk: () => chunk, preloaded: preload ? chunk : undefined })
  if (subscriber) a.nuxtApp.hook('i18n:register', subscriber)
  await runPlugin(plugin)
  await hydrate(a)
  return a
}

/** Median ms of the requests after the first, which loads. */
async function medianRequest(options: Parameters<typeof request>[0], runs = 9) {
  await request(options)
  const times: number[] = []
  for (let run = 0; run < runs; run++) {
    const start = performance.now()
    const a = await request(options)
    a.nuxtApp.$t('key_5')
    times.push(performance.now() - start)
  }
  return times.toSorted((x, y) => x - y)[runs >> 1]!
}

describe('shared chunks', () => {
  test('a patch leaves a stored chunk as it was, on the server and in the browser', async () => {
    for (const side of ['server', 'client'] as const) {
      translationStorage.clear()
      const stored = deepFreeze({ a: { b: 'b' }, c: 'c' })
      const a = await createApp({ side, strategy: 'prefix', url: '/en/about', detected: 'en', chunk: () => stored })
      a.nuxtApp.hook('i18n:register', ((register) => register({ a: { added: 'added' } })) as Subscriber)
      await runPlugin(plugin)
      await hydrate(a)
      a.nuxtApp.$mergeTranslations({ a: { merged: 'merged' }, top: 'top' })
      a.nuxtApp.$setTranslation('a.set', 'set')
      await a.nuxtApp.$loadPageTranslations('en', 'about', { page: 'page' })
      await a.nuxtApp.$loadPageTranslations('de', 'about', { other: 'other' })
      expect(a.nuxtApp.$t('a')).toEqual({ b: 'b', added: 'added', merged: 'merged', set: 'set' })
      expect(a.nuxtApp.$t('page')).toBe('page')
      expect(stored).toEqual({ a: { b: 'b' }, c: 'c' })
    }
  })

  test('a fresh chunk is stored as it arrived: one tree, no copy', async () => {
    for (const side of ['server', 'client'] as const) {
      translationStorage.clear()
      const fetched = { a: { b: 'b' } }
      const a = await createApp({ side, strategy: 'prefix', url: '/en/about', detected: 'en', chunk: () => fetched })
      await runPlugin(plugin)
      expect(a.nuxtApp.$resolveTranslations()).toBe(fetched)
    }
  })

  test('a patch made while its chunk loads survives the load, and the loaded tree stays as it was', async () => {
    const loaded = deepFreeze({ a: { b: 'b' }, kept: 'loaded' })
    let answer!: (value: typeof loaded) => void
    const a = await createApp({ side: 'client', strategy: 'prefix', url: '/en/about' })
    await runPlugin(plugin)
    vi.stubGlobal('$fetch', () => new Promise((resolve) => (answer = resolve)))
    const navigation = a.router.push('/de/about')
    await vi.waitFor(() => expect(answer).toBeDefined())
    await a.nuxtApp.$loadPageTranslations('de', 'about', { a: { patched: 'patched' }, kept: 'patched' })
    answer(loaded)
    await navigation
    expect(a.nuxtApp.$resolveTranslations()).toEqual({ a: { b: 'b', patched: 'patched' }, kept: 'patched' })
    expect(loaded).toEqual({ a: { b: 'b' }, kept: 'loaded' })
  })

  test('what one request registers stays in it', async () => {
    const chunk = { shared: 'shared' }
    const first = await request({ chunk, subscriber: (register) => register({ mine: 'mine', shared: 'changed' }) })
    expect(first.nuxtApp.$t('mine')).toBe('mine')
    const second = await request({ chunk })
    expect(second.nuxtApp.$t('mine')).toBe('mine')
    expect(second.nuxtApp.$t('shared')).toBe('shared')
    expect(first.nuxtApp.$t('shared')).toBe('changed')
  })
})

describe('app:rendered', () => {
  const render = async (params: Record<string, unknown> | null) => {
    const a = await request({ chunk: {} })
    if (params) a.nuxtApp.$setI18nRouteParams(params)
    let reads = 0
    const html = '<a class="switcher-locale-de" href="/de/about">de</a>'
    const renderResult = {
      get html() {
        reads++
        return html
      },
      set html(next: string) {
        renderResult.written = next
      },
      written: '',
    }
    await a.nuxtApp.callHook('app:rendered', { renderResult })
    return { reads, written: renderResult.written }
  }

  test('a page with no params leaves the HTML unread', async () => {
    expect(await render(null)).toEqual({ reads: 0, written: '' })
    expect(await render({})).toEqual({ reads: 0, written: '' })
  })

  test('with params the links of the switcher follow them', async () => {
    expect((await render({ de: { id: 'x' } })).written).toBe('<a class="switcher-locale-de" href="/de/about">de</a>')
  })
})

describe('tree identity', () => {
  test('requests share one tree, also with serverTranslationPreload', async () => {
    const chunk = { key: 'value' }
    for (const preload of [false, true]) {
      translationStorage.clear()
      const url = preload ? '/en' : '/en/about'
      const trees = []
      for (let run = 0; run < 3; run++) trees.push((await request({ chunk, preload, url })).nuxtApp.$resolveTranslations())
      expect(trees[1]).toBe(trees[0])
      expect(trees[2]).toBe(trees[0])
    }
  })
})

describe('budget of a server request on a 100k chunk', () => {
  const chunk = bigChunk()

  test('serverTranslationPreload costs next to nothing', { timeout: 60_000 }, async () => {
    const plain = await medianRequest({ chunk, url: '/en' })
    const preloaded = await medianRequest({ chunk, preload: true, url: '/en' })
    expect(preloaded).toBeLessThan(Math.max(plain * 4, 4))
  })

  test('an i18n:register subscriber costs its patch', { timeout: 60_000 }, async () => {
    const plain = await medianRequest({ chunk })
    const subscribed = await medianRequest({ chunk, subscriber: (register) => register({ extra: 'extra' }) })
    expect(subscribed).toBeLessThan(Math.max(plain * 4, 4))
  })
})
