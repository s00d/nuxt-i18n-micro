/**
 * Tests for special characters in paths (unicode, encoded segments).
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext } from './test-utils'

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

function pathFromResult(result: unknown): string {
  return typeof result === 'string' ? result : result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : ''
}

function runSpecialCharTests(strategy: StrategyName, expectedPrefix: string) {
  const currentRoute: ResolvedRouteLike = {
    name: null,
    path: '/',
    fullPath: '/',
    params: {},
    query: {},
    hash: '',
  }

  test('path with unicode segment (e.g. Cyrillic path) returns path with expected prefix', () => {
    const s = createPathStrategy(makeCtx(strategy))
    const result = s.localeRoute('de', '/поиск', currentRoute)
    const pathStr = pathFromResult(result)
    expect(pathStr).toBe(expectedPrefix === '' ? '/поиск' : `${expectedPrefix}/поиск`)
  })

  test('path with encoded-like segment is preserved', () => {
    const s = createPathStrategy(makeCtx(strategy))
    const result = s.localeRoute('de', '/search/foo%20bar')
    const pathStr = pathFromResult(result)
    expect(pathStr).toContain(expectedPrefix === '' ? '/' : expectedPrefix)
    expect(pathStr).toContain('search')
  })

  test('path with custom locale route (globalLocaleRoutes) resolves unicode key', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      '/поиск': { en: '/search', de: '/suchen' },
    }
    const s = createPathStrategy(makeCtx(strategy, { globalLocaleRoutes }))
    const result = s.localeRoute('de', '/поиск')
    const pathStr = pathFromResult(result)
    expect(pathStr).toBe(expectedPrefix === '' ? '/suchen' : `${expectedPrefix}/suchen`)
  })
}

describe('localeRoute with special characters in path', () => {
  describe('prefix_except_default', () => {
    runSpecialCharTests('prefix_except_default', '/de')
  })

  describe('prefix', () => {
    runSpecialCharTests('prefix', '/de')
  })

  describe('prefix_and_default', () => {
    runSpecialCharTests('prefix_and_default', '/de')
  })

  describe('no_prefix', () => {
    runSpecialCharTests('no_prefix', '')
  })
})
