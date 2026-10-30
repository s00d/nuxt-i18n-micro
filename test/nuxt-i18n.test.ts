import { describe, expect, test, vi } from 'vitest'
import { effect } from 'vue'
import { formatterFor, NuxtI18n, NuxtTranslationLoader, withDollarAliases } from '../src/runtime/utils/nuxt-i18n'
import { translationStorage } from '../src/runtime/utils/storage'

const loadOptions = { apiBaseUrl: '_locales', baseURL: '/', dateBuild: 0 }

/** A load that resolves when the test says so: the order of navigations is what is under test. */
function deferred() {
  let resolve!: (value: Record<string, unknown>) => void
  const promise = new Promise<Record<string, unknown>>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('NuxtI18n: what a visitor sees while navigating', () => {
  test('page and locale switches, transitions, context events', () => {
    // step 1: en/page-a → page-b → page-c; the transition of a ends late, b is still leaving
    const i18n = new NuxtI18n({ missingWarn: false })
    const reasons: string[] = []
    i18n.onContextChange((reason) => {
      reasons.push(reason)
    })
    i18n.applySwitchContext('en', 'page-a', { a: 'A', common: { nested: 'value' } })
    i18n.applySwitchContext('en', 'page-b', { b: 'B' })
    expect(i18n.has('common.nested')).toBe(true)
    const leavingA = i18n.outgoing
    i18n.applySwitchContext('en', 'page-c', { c: 'C' })
    i18n.finishTransition(leavingA)
    expect(i18n.t('b')).toBe('B')
    i18n.finishTransition(i18n.outgoing)
    expect(i18n.has('b')).toBe(false)
    // the late finish of a is a no-op: only the real end of b's transition refreshes
    expect(reasons).toEqual(['load', 'load', 'load', 'refresh'])

    // step 2: mid-transition precedence — the incoming chunk wins a shared key; the leaving page
    // keeps its deep subtree and its descendants under a namespace the incoming chunk made a
    // scalar; a setTranslation / patch made now survives the end of the transition
    const nav = new NuxtI18n({ missingWarn: false })
    nav.applySwitchContext('en', 'page-a', { title: 'A', page: { a: { sub: { deep: 'A deep' } } }, menu: { home: 'Home' } })
    nav.applySwitchContext('en', 'page-b', { title: 'B', page: { b: { title: 'B title' } }, menu: 'B menu' })
    expect(nav.t('title')).toBe('B')
    expect(nav.t('page.a.sub.deep')).toBe('A deep')
    expect(nav.t('menu')).toBe('B menu')
    expect(nav.t('menu.home')).toBe('Home')
    const tree = nav.resolveTranslations() as Record<string, unknown>
    expect(tree.menu).toBe('B menu')
    expect(tree['menu.home']).toBe('Home')
    nav.setTranslation('page.b.title', 'Updated B')
    nav.mergeTranslations({ page: { b: { extra: 'Extra' } } })
    expect(nav.t('page.a.sub.deep')).toBe('A deep')
    nav.finishTransition()
    expect(nav.has('page.a.sub.deep')).toBe(false)
    expect(nav.has('menu.home')).toBe(false)
    expect(nav.t('page.b.title')).toBe('Updated B')
    expect(nav.t('page.b.extra')).toBe('Extra')
    expect(nav.getChunk('en', 'page-b')).toEqual({ title: 'B', page: { b: { title: 'Updated B', extra: 'Extra' } }, menu: 'B menu' })

    // step 3: switch en → de on the same page: no en-only key leaks into de
    const locale = new NuxtI18n({ missingWarn: false })
    locale.applySwitchContext('en', 'page-a', { onlyInEn: 'English only', title: 'EN' })
    locale.applySwitchContext('de', 'page-a', { title: 'DE' })
    expect(locale.t('title')).toBe('DE')
    expect(locale.has('onlyInEn')).toBe(false)
    expect(locale.t('onlyInEn')).toBe('onlyInEn')

    // step 4: edit a key, leave and come back: the edit is in the chunk, resolveTranslations keeps its shape
    const edit = new NuxtI18n({ missingWarn: false })
    const events: string[] = []
    edit.onContextChange((reason) => {
      events.push(reason)
    })
    edit.applySwitchContext('en', 'page-a', { aaa: { bbb: 'ccc' }, ddd: 1111 })
    const settled = edit.resolveTranslations()
    edit.setTranslation('aaa', { fff: 'ggg' })
    expect(edit.t('aaa.fff')).toBe('ggg')
    expect(edit.getChunk('en', 'page-a')).toEqual({ aaa: { fff: 'ggg' }, ddd: 1111 })
    edit.applySwitchContext('en', 'page-b', { zzz: 'z' })
    expect(edit.resolveTranslations()).toEqual({ ...settled, aaa: { fff: 'ggg' }, zzz: 'z' })
    edit.finishTransition()
    edit.applySwitchContext('en', 'page-a', edit.getChunk('en', 'page-a'))
    expect(edit.t('aaa.fff')).toBe('ggg')
    expect(edit.t('ddd')).toBe(1111)

    // step 5: clearCache empties the view and storage
    edit.clearCache()
    expect(edit.has('ddd')).toBe(false)
    expect(edit.getChunk('en', 'page-a')).toEqual({})
    expect(events).toEqual(['load', 'refresh', 'load', 'refresh', 'load', 'refresh'])
  })

  test('a transition re-renders once, unless the old page read a key that is now gone', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { layout: 'L', a: 'A' })
    let renders = 0
    let shown: unknown
    effect(() => {
      renders++
      shown = i18n.t(i18n.getCurrentRouteName() === 'page-b' ? 'layout' : 'a')
    })

    // nothing came from the outgoing chunk: its removal changes no result, so no second render
    renders = 0
    i18n.applySwitchContext('en', 'page-b', { layout: 'L', b: 'B' })
    expect(renders).toBe(1)
    i18n.finishTransition()
    expect(renders).toBe(1)
    expect(i18n.outgoing).toBeNull()

    // a key served from the leaving chunk must stop resolving: that render has to run again
    const leaving = new NuxtI18n({ missingWarn: false })
    leaving.applySwitchContext('en', 'page-a', { a: 'A' })
    effect(() => {
      shown = leaving.t('a')
    })
    leaving.applySwitchContext('en', 'page-b', { b: 'B' })
    expect(shown).toBe('A')
    leaving.finishTransition()
    expect(shown).toBe('a')

    // has() and the resolveTranslations dump read the leaving chunk too
    for (const read of [(i: NuxtI18n) => i.has('a'), (i: NuxtI18n) => 'a' in i.resolveTranslations()]) {
      const other = new NuxtI18n({ missingWarn: false })
      other.applySwitchContext('en', 'page-a', { a: 'A' })
      effect(() => {
        shown = read(other)
      })
      other.applySwitchContext('en', 'page-b', { b: 'B' })
      expect(shown).toBe(true)
      other.finishTransition()
      expect(shown).toBe(false)
    }

    // a hit on the previous transition's chunk says nothing about the next one
    const next = new NuxtI18n({ missingWarn: false })
    next.applySwitchContext('en', 'page-a', { a: 'A' })
    next.applySwitchContext('en', 'page-b', { b: 'B' })
    next.t('a')
    next.applySwitchContext('en', 'page-c', { c: 'C' })
    let runs = 0
    effect(() => {
      runs++
      next.t('c')
    })
    next.finishTransition()
    expect(runs).toBe(1)
  })

  test('route-bound lookups and missing keys', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setRouteContextResolver((route) => route as { locale: string; routeName: string })
    const missing: Array<{ locale: string; key: string; routeName: string }> = []
    i18n.onMissingKey((locale, key, routeName) => {
      missing.push({ locale, key, routeName })
    })
    i18n.setChunk('en', 'page-a', { title: 'Route A' })
    i18n.setChunk('en', 'page-b', { title: 'Route B' })
    i18n.applySwitchContext('en', 'page-b', i18n.getChunk('en', 'page-b'))

    // step 1: tForRoute(page-a) reads page-a while page-b is on screen
    const tForA = i18n.tForRoute({ locale: 'en', routeName: 'page-a' })
    expect(tForA('title')).toBe('Route A')
    expect(i18n.t('title')).toBe('Route B')

    // step 2: a miss through it reports page-a, not the page on screen
    expect(tForA('missing-on-a')).toBe('missing-on-a')
    expect(missing).toEqual([{ locale: 'en', key: 'missing-on-a', routeName: 'page-a' }])
  })

  test('merging into loaded chunks: async loads, nested siblings', async () => {
    // step 1: merge into a page not loaded yet → the loader runs first, then the merge
    const i18n = new NuxtI18n({ missingWarn: false })
    const loader = vi.fn(async (locale: string, routeName?: string) => ({ loaded: `${locale}:${routeName || 'index'}` }))
    i18n.applySwitchContext('en', 'index', { base: 'Base' })
    await i18n.mergeTranslationAsync('en', 'page-a', { extra: 'Extra' }, loader)
    expect(loader).toHaveBeenCalledWith('en', 'page-a')
    expect(i18n.getChunk('en', 'page-a')).toEqual({ loaded: 'en:page-a', extra: 'Extra' })

    // step 2: merge into the page on screen → the view updates, old keys stay
    const active = new NuxtI18n({ missingWarn: false })
    active.applySwitchContext('en', 'page-a', { title: 'Initial' })
    await active.mergeTranslationAsync('en', 'page-a', { injected: 'Yes' }, async () => ({}))
    expect(active.t('injected')).toBe('Yes')
    expect(active.t('title')).toBe('Initial')

    // step 3: a nested merge keeps siblings (a shallow merge would render raw keys next transition)
    const nested = new NuxtI18n({ missingWarn: false })
    nested.setChunk('en', 'index', { nav: { about: 'About', home: 'Home' }, title: 'T' })
    nested.applySwitchContext('en', 'index', nested.getChunk('en', 'index'))
    nested.mergeTranslations({ nav: { extra: 'Extra' } })
    expect(nested.getChunk('en', 'index')).toEqual({ nav: { about: 'About', home: 'Home', extra: 'Extra' }, title: 'T' })
    expect(nested.t('nav.about')).toBe('About')
    expect(nested.t('nav.extra')).toBe('Extra')
    await nested.loadPageTranslations('en', 'index', { nav: { contact: 'Contact' } })
    expect(nested.getChunk('en', 'index')).toEqual({ nav: { about: 'About', home: 'Home', extra: 'Extra', contact: 'Contact' }, title: 'T' })
  })

  test('cacheMaxSize bounds the chunk map but never evicts the page on screen', () => {
    // step 1: bound 3, 20 pages written → at most 3 kept, the active page survives more writes
    const i18n = new NuxtI18n({ missingWarn: false, cacheMaxSize: 3 })
    for (let n = 0; n < 20; n++) i18n.setChunk('en', `page-${n}`, { title: `Page ${n}` })
    expect(i18n.storage.translations.size).toBeLessThanOrEqual(3)
    i18n.applySwitchContext('en', 'page-19', i18n.getChunk('en', 'page-19'))
    for (let n = 0; n < 10; n++) i18n.setChunk('en', `extra-${n}`, { title: `Extra ${n}` })
    expect(i18n.storage.translations.size).toBeLessThanOrEqual(3)
    expect(i18n.storage.translations.has(i18n.getCacheKey('en', 'page-19'))).toBe(true)
    expect(i18n.t('title')).toBe('Page 19')

    // step 2: bound 1 → one entry across navigations; a prefetch wins the slot, the view keeps B
    const one = new NuxtI18n({ missingWarn: false, cacheMaxSize: 1 })
    one.applySwitchContext('en', 'page-a', { title: 'A' })
    expect(one.storage.translations.size).toBe(1)
    one.applySwitchContext('en', 'page-b', { title: 'B' })
    expect(one.storage.translations.size).toBe(1)
    expect(one.storage.translations.has(one.getCacheKey('en', 'page-b'))).toBe(true)
    one.setChunk('en', 'page-c', { title: 'C' })
    expect(one.storage.translations.size).toBe(1)
    expect(one.storage.translations.has(one.getCacheKey('en', 'page-c'))).toBe(true)
    expect(one.t('title')).toBe('B')

    // step 3: bound 0 is no bound
    const unbounded = new NuxtI18n({ missingWarn: false, cacheMaxSize: 0 })
    for (let n = 0; n < 20; n++) unbounded.setChunk('en', `page-${n}`, { title: `Page ${n}` })
    expect(unbounded.storage.translations.size).toBe(20)
  })

  // ponytail: was a time budget (a walk of a large chunk cost ~3.8 ms per navigation, a re-merge ~6.9 ms per
  // patch); counting the objects walked is the same claim without a clock
  test('a navigation and a patch never walk the whole chunk', () => {
    let walked = 0
    const counted = (depth: number): Record<string, unknown> => {
      const entries = Array.from({ length: 6 }, (_, i) => [`n${i}`, depth ? counted(depth - 1) : `v${i}`])
      return new Proxy(Object.fromEntries(entries), {
        ownKeys(target) {
          walked++
          return Reflect.ownKeys(target)
        },
      })
    }
    const chunk = counted(3)
    const i18n = new NuxtI18n({ missingWarn: false })

    // step 1: a page with a loaded chunk, then another one
    i18n.applySwitchContext('en', 'first', counted(3))
    walked = 0
    i18n.applySwitchContext('en', 'second', chunk)
    expect(walked).toBeLessThan(10)

    // step 2: a patch copies the changed path only
    walked = 0
    i18n.mergeTranslations({ n0: { n0: { added: 'v' } } })
    expect(walked).toBeLessThan(10)
    expect(i18n.t('n0.n0.added')).toBe('v')
    expect(i18n.t('n1.n1.n1.n1')).toBe('v1')
  })
})

describe('formatterFor: one FormatService per resolved config on the server', () => {
  const config = { numberFormats: { en: { money: { style: 'currency', currency: 'USD' } } }, timeZone: 'UTC' } as never
  const other = { numberFormats: { en: { money: { style: 'currency', currency: 'EUR' } } }, timeZone: 'Asia/Tokyo' } as never

  test('two requests share Intl objects, and each still renders its own locale', () => {
    const number = vi.spyOn(Intl, 'NumberFormat')
    const request = (locale: string) => {
      const i18n = new NuxtI18n({ formatter: formatterFor(config), missingWarn: false })
      i18n.applySwitchContext(locale, 'index', {})
      return i18n
    }
    const en = request('en')
    const de = request('de')
    expect(en.tn(1234.5)).toBe('1,234.5')
    expect(de.tn(1234.5)).toBe('1.234,5')
    expect(en.tn(1234.5)).toBe('1,234.5')
    expect(request('en').tn(1)).toBe('1')
    expect(number).toHaveBeenCalledTimes(2)
    number.mockRestore()
  })

  test('a different config, a runtime override or another host, gets its own formats and zone', () => {
    expect(formatterFor(config)).toBe(formatterFor(config))
    expect(formatterFor(other)).not.toBe(formatterFor(config))
    expect(formatterFor(other).formatNumber(1, 'en', formatterFor(other).resolveNumberFormat('en', 'money'))).toBe('€1.00')
    expect(formatterFor(config).formatDate(0, 'en', { hour: 'numeric', hourCycle: 'h23' })).toBe('00')
    expect(formatterFor(other).formatDate(0, 'en', { hour: 'numeric', hourCycle: 'h23' })).toBe('09')
  })
})

describe('$i18n', () => {
  test('both spellings read the same function, per object, without a second set of properties', () => {
    const first = withDollarAliases({ t: () => 'first', getLocale: () => 'en' })
    const second = withDollarAliases({ t: () => 'second', getLocale: () => 'de' })

    const { $t, t } = first as typeof first & { $t: typeof first.t }
    expect($t).toBe(t)
    expect(($t as () => string)()).toBe('first')
    // two requests: the shared accessors hold nothing of either
    expect((second as typeof second & { $t: typeof second.t }).$t()).toBe('second')
    expect(Object.keys(first)).toEqual(['t', 'getLocale'])
  })
})

describe('NuxtI18n: context listeners', () => {
  test('a throwing listener stops nobody, an unsubscribed one is not called', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const i18n = new NuxtI18n({ missingWarn: false })
    const calls: string[] = []
    i18n.onContextChange(() => {
      throw new Error('devtools')
    })
    const offLater = () => off()
    i18n.onContextChange(() => {
      calls.push('first')
      offLater()
    })
    const off = i18n.onContextChange(() => calls.push('removed'))
    i18n.onContextChange(() => calls.push('last'))

    expect(() => i18n.applySwitchContext('en', 'about', { title: 'A' })).not.toThrow()
    expect(calls).toEqual(['first', 'last'])
    expect(i18n.t('title')).toBe('A')
    expect(error).toHaveBeenCalledOnce()
    error.mockRestore()
  })
})

describe('NuxtTranslationLoader: reload', () => {
  const setup = (data: Record<string, unknown>) => {
    translationStorage.clear()
    const i18n = new NuxtI18n({ missingWarn: false })
    const loader = new NuxtTranslationLoader({ i18n, loadOptions })
    i18n.applySwitchContext('en', 'about', data)
    return { i18n, loader }
  }

  test('a response requested before the reload is never installed', async () => {
    const { i18n, loader } = setup({ title: 'Old' })
    const responses = [deferred(), deferred()]
    const fetchMock = vi.fn(() => responses[fetchMock.mock.calls.length - 1]!.promise)
    vi.stubGlobal('$fetch', fetchMock)
    try {
      const inFlight = loader.loadAsync('en', 'about')
      const reloading = loader.reload()
      responses[0]!.resolve({ title: 'pre-edit' })
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
      expect(i18n.t('title')).toBe('Old')
      responses[1]!.resolve({ title: 'fresh' })
      await reloading
      expect(await inFlight).toEqual({ title: 'fresh' })
      expect(i18n.t('title')).toBe('fresh')
      expect(translationStorage.getFromCache('en', 'about')?.data).toEqual({ title: 'fresh' })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  test('a failed reload keeps the dictionary on screen', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { i18n, loader } = setup({ title: 'Hi' })
    vi.stubGlobal('$fetch', () => Promise.reject(new Error('offline')))
    try {
      await loader.reload()
      expect(i18n.t('title')).toBe('Hi')
    } finally {
      vi.unstubAllGlobals()
      warn.mockRestore()
    }
  })

  test('a reload during a transition keeps the leaving page until it unmounts', async () => {
    const { i18n, loader } = setup({ leaving: 'A' })
    i18n.applySwitchContext('en', 'about', { arriving: 'B' })
    const outgoing = i18n.outgoing
    vi.stubGlobal('$fetch', async () => ({ arriving: 'B2' }))
    try {
      await loader.reload()
      expect(i18n.t('arriving')).toBe('B2')
      expect(i18n.t('leaving')).toBe('A')
      i18n.finishTransition(outgoing)
      expect(i18n.has('leaving')).toBe(false)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('NuxtTranslationLoader: loads racing navigations', () => {
  test('cache hit, reload, stale switch, invalidated switch', async () => {
    translationStorage.clear()
    const i18n = new NuxtI18n({ missingWarn: false })
    const loader = new NuxtTranslationLoader({ i18n, loadOptions })

    // step 1: a chunk in memory is a sync hit, no network
    i18n.setChunk('en', 'about', { title: 'Old', gone: 'Gone' })
    expect(loader.loadFromCacheSync('en', 'about')).toEqual({ title: 'Old', gone: 'Gone' })

    // step 2: reload keeps Old on screen until the fresh dictionary lands, then drops removed keys
    // and every other cached chunk (reloaded on next use)
    i18n.applySwitchContext('en', 'about', i18n.getChunk('en', 'about'))
    i18n.setChunk('de', 'about', { title: 'DE' })
    const fresh = deferred()
    const loads = new Map<string, Promise<Record<string, unknown>>>([['en', fresh.promise]])
    const loadSpy = vi
      .spyOn(translationStorage, 'load')
      .mockImplementation(async (locale) => ({ data: await (loads.get(locale) ?? Promise.resolve({ title: 'other' })), cacheKey: `${locale}:about` }))
    try {
      const reloading = loader.reload()
      expect(i18n.t('title')).toBe('Old')
      fresh.resolve({ title: 'New' })
      await reloading
      expect(i18n.t('title')).toBe('New')
      expect(i18n.has('gone')).toBe(false)
      expect(i18n.hasChunk('de', 'about')).toBe(false)

      // step 3: switch to de (slow), then fr (cached) wins; de landing later changes nothing
      const de = deferred()
      loads.set('de', de.promise)
      i18n.setChunk('fr', 'about', { title: 'FR' })
      const stale = loader.switchContext('de', 'about')
      expect(await loader.switchContext('fr', 'about')).toBe(true)
      expect(i18n.getCurrentLocale()).toBe('fr')
      de.resolve({ title: 'DE' })
      expect(await stale).toBe(false)
      expect(i18n.getCurrentLocale()).toBe('fr')
      expect(i18n.t('title')).toBe('FR')

      // step 4: a pending switch is cancelled even when the caller skips switchContext
      // (the next navigation keeps the applied context)
      const ru = deferred()
      loads.set('ru', ru.promise)
      const pending = loader.switchContext('ru', 'about')
      loader.invalidatePendingSwitches()
      ru.resolve({ title: 'RU' })
      expect(await pending).toBe(false)
      expect(i18n.getCurrentLocale()).toBe('fr')
      expect(i18n.t('title')).toBe('FR')
    } finally {
      loadSpy.mockRestore()
    }
  })
})
