/**
 * TDD: localeRoute when given query/hash must return result containing query (and hash),
 * otherwise params are lost on link click (E2E: test query parameters and hash on news page).
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
  ],
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: false,
}

type StrategyName = 'prefix_except_default' | 'prefix' | 'prefix_and_default' | 'no_prefix'

function makeCtx(strategy: StrategyName, extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, strategy, extra)
}

const currentRoute: ResolvedRouteLike = {
  name: 'localized-news-id-en',
  path: '/news/2',
  fullPath: '/news/2?a=b#tada',
  params: {},
  query: {},
  hash: '',
}

function runQueryHashTests(strategy: StrategyName, _expectedEnPath: string) {
  test('when input has query, result must include query (object or fullPath with query)', () => {
    const router = makeRouterAdapter(['news-id', 'localized-news-id-en', 'localized-news-id-de'])
    router.resolve = (to: RouteLike | string) => {
      if (typeof to === 'string') {
        return { name: to, path: to, fullPath: to, params: {}, query: {}, hash: '' }
      }
      const r = to as RouteLike
      const path = '/news/2'
      const query = r.query ?? {}
      const hash = (r as { hash?: string }).hash ?? ''
      const fullPath = path + (Object.keys(query).length ? '?' + new URLSearchParams(query as Record<string, string>).toString() : '') + (hash ? (hash.startsWith('#') ? hash : '#' + hash) : '')
      return {
        name: r.name ?? null,
        path,
        fullPath,
        params: r.params ?? {},
        query,
        hash,
      }
    }
    const s = createPathStrategy(makeCtx(strategy, { router }))
    const input: RouteLike = { name: 'news-id', params: { id: '2' }, query: { a: 'b' } }
    const result = s.localeRoute('en', input, currentRoute)
    expect(result.query).toEqual({ a: 'b' })
    expect(result.fullPath).toContain('?')
    expect(result).toMatchSnapshot()
  })

  test('when input has query and hash, result must include both', () => {
    const router = makeRouterAdapter(['news-id'])
    router.resolve = (to: RouteLike | string) => {
      if (typeof to === 'string') return { name: to, path: to, fullPath: to, params: {}, query: {}, hash: '' }
      const r = to as RouteLike
      const path = '/news/2'
      const query = r.query ?? {}
      const hash = (r as { hash?: string }).hash ?? ''
      const fullPath = path + (Object.keys(query).length ? '?' + new URLSearchParams(query as Record<string, string>).toString() : '') + (hash ? (hash.startsWith('#') ? hash : '#' + hash) : '')
      return { name: r.name ?? null, path, fullPath, params: r.params ?? {}, query, hash }
    }
    const s = createPathStrategy(makeCtx(strategy, { router }))
    const input: RouteLike = { name: 'news-id', params: { id: '2' }, query: { a: 'b' }, hash: '#tada' }
    const result = s.localeRoute('en', input, currentRoute)
    expect(result.query).toEqual({ a: 'b' })
    expect(result.hash).toBe('#tada')
    expect(result).toMatchSnapshot()
  })

  test('returned structure: object has path, fullPath, query, hash when input has query/hash', () => {
    const router = makeRouterAdapter(['news-id'])
    router.resolve = () => ({ name: 'news-id', path: '/news/2', fullPath: '/news/2', params: {}, query: {}, hash: '' })
    const s = createPathStrategy(makeCtx(strategy, { router }))
    const input: RouteLike = { name: 'news-id', params: { id: '2' }, query: { a: 'b' }, hash: '#tada' }
    const result = s.localeRoute('en', input, currentRoute)
    expect(result.path).toBeDefined()
    expect(result.fullPath).toBeDefined()
    expect(result.query).toEqual({ a: 'b' })
    expect(result.hash).toBe('#tada')
    expect(result).toMatchSnapshot()
  })
}

describe('localeRoute: preserve query and hash from input', () => {
  describe('prefix_except_default', () => {
    runQueryHashTests('prefix_except_default', '/news/2')
  })

  describe('prefix', () => {
    runQueryHashTests('prefix', '/en/news/2')
  })

  describe('prefix_and_default', () => {
    runQueryHashTests('prefix_and_default', '/en/news/2')
  })

  describe('no_prefix', () => {
    runQueryHashTests('no_prefix', '/news/2')
  })
})
