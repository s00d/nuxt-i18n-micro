import { describe, expect, it, vi } from 'vitest'
import { mergeTranslationChunk } from '@i18n-micro/core'
import { NuxtI18n, NuxtTranslationLoader } from '../src/runtime/utils/nuxt-i18n'
import { translationStorage } from '../src/runtime/utils/storage'

describe('NuxtI18n', () => {
  it('does not use fallback locale when key is missing in current locale', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { greeting: 'Hello' })
    i18n.setChunk('de', 'index', { greeting: 'Hallo' })
    i18n.applySwitchContext('en', 'index', i18n.getChunk('en', 'index'))

    expect(i18n.t('greeting')).toBe('Hello')
    expect(i18n.t('missing')).toBe('missing')
  })

  it('deep-merges view layer on same-locale page navigation and cleans up after transition', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { common: { fromA: 'From A' }, pageA: 'A' })
    i18n.applySwitchContext('en', 'page-b', { common: { fromB: 'From B' }, pageB: 'B' })

    expect(i18n.t('common.fromA')).toBe('From A')
    expect(i18n.t('common.fromB')).toBe('From B')
    expect(i18n.t('pageB')).toBe('B')

    i18n.finishTransition()

    expect(i18n.has('common.fromA')).toBe(false)
    expect(i18n.t('common.fromB')).toBe('From B')
  })

  it('keeps deeply nested outgoing keys visible during a same-locale transition', () => {
    // The failure this pins: both chunks share the `page` namespace, so a one-level merge
    // replaced it wholesale and the outgoing page's own subtree vanished mid-transition —
    // it rendered raw keys while it was still mounted.
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { page: { a: { title: 'A title', sub: { deep: 'A deep' } } } })
    i18n.applySwitchContext('en', 'page-b', { page: { b: { title: 'B title' } } })

    expect(i18n.t('page.a.title')).toBe('A title')
    expect(i18n.t('page.a.sub.deep')).toBe('A deep')
    expect(i18n.t('page.b.title')).toBe('B title')

    i18n.finishTransition()

    expect(i18n.has('page.a.title')).toBe(false)
    expect(i18n.t('page.b.title')).toBe('B title')
  })

  it('lets the incoming chunk win over the outgoing one on a shared key', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { title: 'A' })
    i18n.applySwitchContext('en', 'page-b', { title: 'B' })

    expect(i18n.t('title')).toBe('B')
  })

  it('keeps a patch applied mid-transition after the transition ends', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { nav: { about: 'About' } })
    i18n.applySwitchContext('en', 'page-b', { nav: { about: 'About' } })

    i18n.mergeTranslations({ nav: { extra: 'Extra' } })
    i18n.finishTransition()

    expect(i18n.t('nav.extra')).toBe('Extra')
  })

  it('clears pending cleanup on locale switch', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { title: 'EN A' })
    i18n.applySwitchContext('en', 'page-b', { title: 'EN B' })
    i18n.applySwitchContext('de', 'page-a', { title: 'DE A' })

    expect(i18n.t('title')).toBe('DE A')
    i18n.finishTransition()
    expect(i18n.t('title')).toBe('DE A')
  })

  it('does not leak previous-locale keys after locale switch', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { onlyInEn: 'English only', title: 'EN' })
    i18n.applySwitchContext('de', 'page-a', { title: 'DE' })

    expect(i18n.t('title')).toBe('DE')
    expect(i18n.has('onlyInEn')).toBe(false)
    expect(i18n.t('onlyInEn')).toBe('onlyInEn')
  })

  it('resolves route-specific translations via tForRoute', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setRouteContextResolver((route) => route as { locale: string; routeName: string })
    i18n.setChunk('en', 'page-a', { title: 'Route A' })
    i18n.setChunk('en', 'page-b', { title: 'Route B' })
    i18n.applySwitchContext('en', 'page-b', i18n.getChunk('en', 'page-b'))

    const tForA = i18n.tForRoute({ locale: 'en', routeName: 'page-a' })
    expect(tForA('title')).toBe('Route A')
    expect(i18n.t('title')).toBe('Route B')
  })

  it('has() checks merged view layer including nested keys', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { common: { nested: 'value' } })
    i18n.applySwitchContext('en', 'page-b', { other: 'x' })

    expect(i18n.has('common.nested')).toBe(true)
  })

  it('mergeTranslationAsync loads missing chunk before merging', async () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    const loader = vi.fn(async (locale: string, routeName?: string) => {
      return { loaded: `${locale}:${routeName || 'index'}` }
    })

    i18n.applySwitchContext('en', 'index', { base: 'Base' })
    await i18n.mergeTranslationAsync('en', 'page-a', { extra: 'Extra' }, loader)

    expect(loader).toHaveBeenCalledWith('en', 'page-a')
    expect(i18n.getChunk('en', 'page-a')).toEqual({ loaded: 'en:page-a', extra: 'Extra' })
  })

  it('mergeTranslationAsync updates active view when locale and route match', async () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { title: 'Initial' })

    await i18n.mergeTranslationAsync('en', 'page-a', { injected: 'Yes' }, async () => ({}))

    expect(i18n.t('injected')).toBe('Yes')
    expect(i18n.t('title')).toBe('Initial')
  })

  it('interpolates params in t()', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'index', { hello: 'Hello {name}' })

    expect(i18n.t('hello', { name: 'World' })).toBe('Hello World')
  })

  it('clearCache resets storage and view layer', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'index', { title: 'Hello' })
    i18n.clearCache()

    expect(i18n.has('title')).toBe(false)
    expect(i18n.getChunk('en', 'index')).toEqual({})
  })

  it('getTranslations exposes the merged view layer during a transition', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { common: { fromA: 'From A' } })
    i18n.applySwitchContext('en', 'page-b', { common: { fromB: 'From B' }, pageB: 'B' })

    expect(i18n.getTranslations()).toEqual({
      common: { fromA: 'From A', fromB: 'From B' },
      pageB: 'B',
    })
    expect(i18n.t('common.fromA')).toBe('From A')
    expect(i18n.t('pageB')).toBe('B')
  })

  it('setTranslation updates the active view and persisted chunk', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { aaa: { bbb: 'ccc' }, ddd: 1111 })

    i18n.setTranslation('aaa', { fff: 'ggg' })
    expect(i18n.t('aaa.fff')).toBe('ggg')
    expect(i18n.getChunk('en', 'page-a')).toEqual({ aaa: { fff: 'ggg' }, ddd: 1111 })

    i18n.applySwitchContext('en', 'page-b', { other: 'x' })
    i18n.applySwitchContext('en', 'page-a', i18n.getChunk('en', 'page-a'))

    expect(i18n.t('aaa.fff')).toBe('ggg')
    expect(i18n.t('ddd')).toBe(1111)
  })

  it('setTranslation during a transition does not remove outgoing keys', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { page: { a: { title: 'A title' } } })
    i18n.applySwitchContext('en', 'page-b', { page: { b: { title: 'B title' } } })

    i18n.setTranslation('page.b.title', 'Updated B')

    expect(i18n.t('page.a.title')).toBe('A title')
    expect(i18n.t('page.b.title')).toBe('Updated B')
  })
})

describe('NuxtTranslationLoader SSR chunk recording', () => {
  const loadOptions = {
    apiBaseUrl: '_locales',
    baseURL: '/',
    dateBuild: 0,
  }

  it('records in-memory chunk hits via setSsrChunk', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    const setSsrChunk = vi.fn()
    const loader = new NuxtTranslationLoader({ i18n, loadOptions, setSsrChunk })

    i18n.setChunk('en', 'index', { title: 'Warm cache' })
    expect(loader.loadFromCacheSync('en', 'index')).toEqual({ title: 'Warm cache' })
    expect(setSsrChunk).toHaveBeenCalledWith('en:index', { title: 'Warm cache' })
  })

  it('records translationStorage cache hits via setSsrChunk', () => {
    translationStorage.clear()
    const i18n = new NuxtI18n({ missingWarn: false })
    const setSsrChunk = vi.fn()
    const loader = new NuxtTranslationLoader({ i18n, loadOptions, setSsrChunk })

    translationStorage.seedFromSsrChunks({ 'en:about': { title: 'About' } })
    expect(loader.loadFromCacheSync('en', 'about')).toEqual({ title: 'About' })
    expect(setSsrChunk).toHaveBeenCalledWith('en:about', { title: 'About' })
  })
})

describe('seeding SSR chunks', () => {
  it('installs buckets for contexts other than the rendered page', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.seedChunks({ 'en:index': { a: 'A' }, 'de:about': { b: 'B' } })

    expect(i18n.getChunk('en', 'index')).toEqual({ a: 'A' })
    expect(i18n.getChunk('de', 'about')).toEqual({ b: 'B' })
  })

  it('never overwrites a chunk that is already loaded', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { a: 'full', extra: 'kept' })
    i18n.seedChunks({ 'en:index': { a: 'from-payload' } })

    expect(i18n.getChunk('en', 'index')).toEqual({ a: 'full', extra: 'kept' })
  })
})

describe('merging translations into a loaded chunk', () => {
  /**
   * A shallow merge here loses siblings silently: nothing throws, the keys simply resolve
   * to themselves on the next transition, which is the raw-key render the transition
   * machinery exists to prevent.
   */
  it('keeps sibling keys under a nested object', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { nav: { about: 'About', home: 'Home' } })
    i18n.applySwitchContext('en', 'index', i18n.getChunk('en', 'index'))

    i18n.mergeTranslations({ nav: { extra: 'Extra' } })

    expect(i18n.getChunk('en', 'index')).toEqual({ nav: { about: 'About', home: 'Home', extra: 'Extra' } })
    expect(i18n.t('nav.about')).toBe('About')
    expect(i18n.t('nav.extra')).toBe('Extra')
  })

  it('keeps them once a pending transition finishes', () => {
    // `finishTransition` promotes the stored chunk into the live dictionary, so a lossy
    // merge only surfaces here — after the navigation, on a page that rendered fine.
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'page-a', { nav: { about: 'About' } })
    i18n.applySwitchContext('en', 'page-b', { nav: { about: 'About' } })

    i18n.mergeTranslations({ nav: { extra: 'Extra' } })
    i18n.finishTransition()

    expect(i18n.t('nav.about')).toBe('About')
    expect(i18n.t('nav.extra')).toBe('Extra')
  })

  it('merges at any depth, not just the first level', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { page: { index: { title: 'Title', sub: 'Sub' } } })
    i18n.applySwitchContext('en', 'index', i18n.getChunk('en', 'index'))

    i18n.mergeTranslations({ page: { index: { extra: 'Extra' } } })

    expect(i18n.t('page.index.title')).toBe('Title')
    expect(i18n.t('page.index.sub')).toBe('Sub')
    expect(i18n.t('page.index.extra')).toBe('Extra')
  })

  it('keeps them when a page loads its translations at runtime', async () => {
    // `$loadPageTranslations` takes whole page translations, which in a real locale file
    // are nested — the most likely way to hit this.
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { nav: { about: 'About' }, title: 'T' })
    i18n.applySwitchContext('en', 'index', i18n.getChunk('en', 'index'))

    await i18n.loadPageTranslations('en', 'index', { nav: { contact: 'Contact' } })

    expect(i18n.getChunk('en', 'index')).toEqual({ nav: { about: 'About', contact: 'Contact' }, title: 'T' })
  })

  it('lets a runtime override survive a later fetch of the same chunk', () => {
    // The loader merges with `preserveExisting`, which must not flatten the fetched tree.
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { nav: { about: 'Overridden' } })

    const fetched = { nav: { about: 'About', home: 'Home' } }
    expect(mergeTranslationChunk(i18n.getChunk('en', 'index'), fetched, { preserveExisting: true })).toEqual({
      nav: { about: 'Overridden', home: 'Home' },
    })
  })
})

describe('merge cost', () => {
  /**
   * Both paths merge, and which merge they use is a performance decision, not a taste one:
   * a full walk of a large chunk on navigation cost ~3.8 ms, and applying a patch by
   * re-merging the whole chunk into the view cost ~6.9 ms. Neither showed up in any
   * assertion, so a budget stands in for one. The threshold is loose on purpose — this
   * catches an algorithmic regression, not a slow machine.
   */
  const buildChunk = (breadth: number, depth: number): Record<string, unknown> => {
    const leaf = (): Record<string, unknown> => Object.fromEntries(Array.from({ length: breadth }, (_, i) => [`k${i}`, `v${i}`]))
    let node = leaf()
    for (let level = 0; level < depth; level++) {
      node = Object.fromEntries(Array.from({ length: breadth }, (_, i) => [`n${i}`, level === 0 ? leaf() : node]))
    }
    return node
  }

  const averageMs = (runs: number, fn: (run: number) => void): number => {
    fn(0)
    const start = process.hrtime.bigint()
    for (let run = 0; run < runs; run++) fn(run)
    return Number(process.hrtime.bigint() - start) / 1e6 / runs
  }

  it('does not walk the whole chunk on navigation or on a patch', () => {
    const chunk = buildChunk(24, 3)
    const other = buildChunk(24, 3)

    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.applySwitchContext('en', 'first', other)

    const navigation = averageMs(20, (run) => i18n.applySwitchContext('en', `route-${run}`, chunk))
    const patch = averageMs(20, (run) => i18n.mergeTranslations({ n0: { [`added${run}`]: 'v' } }))

    expect(navigation, `navigation took ${navigation.toFixed(2)} ms`).toBeLessThan(1)
    expect(patch, `patch took ${patch.toFixed(2)} ms`).toBeLessThan(1)
  })
})
