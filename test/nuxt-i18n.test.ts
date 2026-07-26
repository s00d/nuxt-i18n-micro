import { describe, expect, it, vi } from 'vitest'
import { NuxtI18n } from '../src/runtime/utils/nuxt-i18n'

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
})

describe('render set recording', () => {
  const recorderFor = (i18n: NuxtI18n) => {
    const seen: Record<string, Record<string, unknown>> = {}
    i18n.setKeyRecorder((cacheKey, key, value) => {
      seen[cacheKey] ??= {}
      seen[cacheKey]![key] = value
    })
    return seen
  }

  it('records only the keys that resolved, under the active cache key', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { greeting: 'Hello', unused: 'Nope', nested: { deep: 'Deep' } })
    i18n.applySwitchContext('en', 'index', i18n.getChunk('en', 'index'))
    const seen = recorderFor(i18n)

    i18n.t('greeting')
    i18n.t('nested.deep')
    i18n.t('missing')

    expect(seen).toEqual({ 'en:index': { greeting: 'Hello', 'nested.deep': 'Deep' } })
  })

  it('records keys probed through has(), which also shape the markup', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { maybe: 'Yes' })
    i18n.applySwitchContext('en', 'index', i18n.getChunk('en', 'index'))
    const seen = recorderFor(i18n)

    expect(i18n.has('maybe')).toBe(true)
    expect(i18n.has('absent')).toBe(false)

    // Without this, `v-if="$has(k)"` renders server-side from a key the client
    // cannot see until the full chunk lands — a hydration mismatch.
    expect(seen).toEqual({ 'en:index': { maybe: 'Yes' } })
  })

  it('stops recording once the recorder is detached', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { greeting: 'Hello' })
    i18n.applySwitchContext('en', 'index', i18n.getChunk('en', 'index'))
    const seen = recorderFor(i18n)

    i18n.setKeyRecorder(null)
    i18n.t('greeting')

    expect(seen).toEqual({})
  })

  it('resolves a flat render set exactly like the nested chunk it came from', () => {
    const full = { nested: { deep: 'Deep' }, greeting: 'Hello' }

    const server = new NuxtI18n({ missingWarn: false })
    server.setChunk('en', 'index', full)
    server.applySwitchContext('en', 'index', server.getChunk('en', 'index'))
    const seen = recorderFor(server)
    server.t('nested.deep')
    server.t('greeting')

    // What the client is seeded with: flat keys, no nesting rebuilt.
    const renderSet = seen['en:index']!
    expect(Object.keys(renderSet).sort()).toEqual(['greeting', 'nested.deep'])

    const client = new NuxtI18n({ missingWarn: false })
    client.setChunk('en', 'index', renderSet)
    client.applySwitchContext('en', 'index', renderSet)

    expect(client.t('nested.deep')).toBe('Deep')
    expect(client.t('greeting')).toBe('Hello')
  })
})

describe('completing a render-set seed', () => {
  it('makes keys outside the render set resolvable and drops the flat seed keys', () => {
    const full = { nested: { deep: 'Deep' }, other: 'Other' }
    const renderSet = { 'nested.deep': 'Deep' }

    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', renderSet)
    i18n.applySwitchContext('en', 'index', renderSet)

    // Seeded state: what the server rendered resolves, the rest does not yet.
    expect(i18n.t('nested.deep')).toBe('Deep')
    expect(i18n.t('other')).toBe('other')

    i18n.completeChunk('en', 'index', full, Object.keys(renderSet))

    // `setChunk` alone would leave `cachedTranslations` on the seed, so this is the
    // assertion that catches a completion that never reaches the lookup path.
    expect(i18n.t('other')).toBe('Other')
    expect(i18n.t('nested.deep')).toBe('Deep')
    expect(Object.keys(i18n.getChunk('en', 'index'))).not.toContain('nested.deep')
  })

  it('keeps render-set keys that the fetched chunk does not provide', () => {
    // Component-local `$defineI18nRoute` translations live only in the render set:
    // no locale file carries them, so dropping them on completion would leave the
    // key rendering as its own name (issue #210's flicker).
    const i18n = new NuxtI18n({ missingWarn: false })
    const renderSet = { 'nested.deep': 'Deep', vehicleType: 'Type de vehicule' }
    i18n.setChunk('fr', 'index', renderSet)
    i18n.applySwitchContext('fr', 'index', renderSet)

    i18n.completeChunk('fr', 'index', { nested: { deep: 'Deep' } }, Object.keys(renderSet))

    expect(i18n.t('nested.deep')).toBe('Deep')
    expect(i18n.t('vehicleType')).toBe('Type de vehicule')
  })

  it('leaves a non-active context untouched', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { a: 'A' })
    i18n.applySwitchContext('en', 'index', { a: 'A' })

    i18n.completeChunk('de', 'index', { b: 'B' }, [])

    expect(i18n.t('b')).toBe('b')
    expect(i18n.getChunk('de', 'index')).toEqual({ b: 'B' })
  })
})

describe('seeding render-set buckets', () => {
  it('installs buckets for contexts other than the rendered page', () => {
    // `$tForRoute()` resolves straight against `getChunk()`. The loader only installs
    // the chunk for the page being rendered, so without seeding every recorded bucket
    // these keys hydrate as missing.
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.seedChunks({ 'en:index': { a: 'A' }, 'de:about': { b: 'B' } })

    expect(i18n.getChunk('en', 'index')).toEqual({ a: 'A' })
    expect(i18n.getChunk('de', 'about')).toEqual({ b: 'B' })
  })

  it('never overwrites a chunk that is already loaded', () => {
    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.setChunk('en', 'index', { a: 'full', extra: 'kept' })
    i18n.seedChunks({ 'en:index': { a: 'render-set' } })

    expect(i18n.getChunk('en', 'index')).toEqual({ a: 'full', extra: 'kept' })
  })

  it('carries a key named __proto__ through the render set', () => {
    // Assigning `bucket.__proto__ = v` on a plain object sets the prototype instead
    // of creating a property, so such a key would render on the server and vanish
    // from the payload. The recorder buckets are Maps for exactly this reason.
    const recorded = new Map<string, Map<string, unknown>>()
    const bucket = new Map<string, unknown>()
    bucket.set('__proto__', 'polluted')
    bucket.set('normal', 'ok')
    recorded.set('en:index', bucket)

    const payload = Object.fromEntries([...recorded].map(([k, v]) => [k, Object.fromEntries(v)]))

    expect(Object.hasOwn(payload['en:index']!, '__proto__')).toBe(true)
    expect(Object.getPrototypeOf(payload['en:index'])).toBe(Object.prototype)

    const i18n = new NuxtI18n({ missingWarn: false })
    i18n.seedChunks(payload as Record<string, Record<string, unknown>>)
    i18n.applySwitchContext('en', 'index', payload['en:index'] as Record<string, unknown>)
    expect(i18n.t('normal')).toBe('ok')
  })
})
